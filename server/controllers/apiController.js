import { randomUUID } from 'node:crypto'
import { loadStore, saveStore } from '../models/store.js'
import { handleAuthRequest } from './authController.js'
import { handleProfileRequest } from './profileController.js'
import { authenticatedUser, fail, hasControlCharacters, json, validText } from './shared.js'
import { logError } from '../security/logger.js'

const port = Number(process.env.API_PORT || 4000)
const platformFee = 350
const maxRequestBytes = 64 * 1024
const authRateLimit = new Map()

async function readBody(request) {
  const contentType = request.headers['content-type']?.split(';', 1)[0].trim().toLowerCase()
  const hasBody = request.headers['content-length'] !== undefined || request.headers['transfer-encoding'] !== undefined
  if (!hasBody || (request.headers['content-length'] === '0' && request.headers['transfer-encoding'] === undefined)) return {}
  if (contentType !== 'application/json') throw fail(415, 'Requests must use application/json.')

  const chunks = []
  let size = 0
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += bytes.length
    if (size > maxRequestBytes) throw fail(413, 'Request body is too large.')
    chunks.push(bytes)
  }
  if (!size) return {}
  let body
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw fail(400, 'Request body must be valid JSON.')
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw fail(400, 'Request body must be a JSON object.')
  }
  return body
}

function enforceAuthRateLimit(request) {
  if (request.method !== 'POST' || !['/api/auth/login', '/api/auth/register'].includes(new URL(request.url, 'http://localhost').pathname)) return

  const now = Date.now()
  const address = request.socket.remoteAddress || 'unknown'
  const current = authRateLimit.get(address)
  if (!current && authRateLimit.size >= 10_000) {
    for (const [key, value] of authRateLimit) {
      if (value.resetAt <= now) authRateLimit.delete(key)
    }
    if (authRateLimit.size >= 10_000) throw fail(503, 'Authentication is temporarily unavailable. Try again shortly.')
  }
  const record = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + 60_000 }
    : current
  if (record.count >= 10) throw fail(429, 'Too many authentication attempts. Try again in one minute.')
  record.count += 1
  authRateLimit.set(address, record)

  if (authRateLimit.size > 10_000) {
    for (const [key, value] of authRateLimit) {
      if (value.resetAt <= now) authRateLimit.delete(key)
    }
  }
}

function isSecureRequest(request) {
  if (request.socket.encrypted) return true
  const forwardedProtocol = request.headers['x-forwarded-proto']
  return process.env.TRUST_PROXY === 'true'
    && typeof forwardedProtocol === 'string'
    && forwardedProtocol.split(',')[0].trim().toLowerCase() === 'https'
}

function publicAccount(account) {
  const visible = { ...account }
  delete visible.ownerId
  return visible
}

function submissionAccount(submission, user) {
  const keyByGame = {
    'Mobile Legends': 'mlbb',
    eFootball: 'efootball',
    PUBG: 'pubg',
    'PUBG Mobile': 'pubg',
    'Free Fire': 'freefire',
    Valorant: 'valorant',
  }
  const gameKey = keyByGame[submission.game] || 'mlbb'
  const imageKey = gameKey === 'valorant' ? 'mlbb' : gameKey
  const image = `/images/drukgg_${imageKey}_account_${{
    mlbb: '1790787283536',
    efootball: '1790787296966',
    pubg: '1790787311472',
    freefire: '1790787323353',
    valorant: '1790787283536',
  }[gameKey]}.jpg`
  return {
    id: `account-${submission.id}`,
    title: submission.title,
    game: submission.game,
    gameKey,
    level: submission.level,
    rank: submission.rank,
    skinsCount: submission.skinsCount,
    server: submission.server,
    price: submission.price,
    isVerified: true,
    image,
    thumbnail: image,
    description: submission.description,
    seller: { name: user.name, verified: true, rating: 5, salesCount: 0 },
    specs: {
      game: submission.game,
      level: submission.level,
      currentRank: submission.rank,
      skins: submission.skinsCount,
      server: submission.server,
    },
    status: 'active',
    ownerId: user.id,
  }
}

async function handle(request, response) {
  const url = new URL(request.url, 'http://localhost')
  const { pathname } = url
  const method = request.method
  const store = await loadStore()
  const body = ['POST', 'PATCH', 'PUT'].includes(method) ? await readBody(request) : {}

  if (method === 'GET' && pathname === '/') {
    return json(response, 200, { service: 'DrukGG API', status: 'ok', health: '/api/health' })
  }
  if (method === 'GET' && pathname === '/api/health') {
    return json(response, 200, { status: 'ok' })
  }
  const context = { method, pathname, body, request, response, store }
  if (await handleAuthRequest(context)) return
  if (await handleProfileRequest(context)) return
  if (method === 'GET' && pathname === '/api/accounts') {
    let accounts = store.accounts.filter((account) => account.status === 'active')
    const game = url.searchParams.get('game')
    const rawQuery = url.searchParams.get('q')
    if (game && game !== 'all' && !['mlbb', 'efootball', 'pubg', 'freefire', 'valorant'].includes(game)) {
      throw fail(400, 'Select a supported game filter.')
    }
    if (rawQuery !== null && (rawQuery.length > 100 || hasControlCharacters(rawQuery))) {
      throw fail(400, 'Search must be no more than 100 characters.')
    }
    const query = rawQuery?.normalize('NFC').trim().toLowerCase()
    const rawMaxPrice = url.searchParams.get('maxPrice')
    const maxPrice = rawMaxPrice === null ? Infinity : Number(rawMaxPrice)
    if (rawMaxPrice !== null && (!Number.isInteger(maxPrice) || maxPrice < 0 || maxPrice > 100000000)) {
      throw fail(400, 'Enter a valid maximum price.')
    }
    const verified = url.searchParams.get('verified')
    if (verified !== null && !['true', 'false'].includes(verified)) throw fail(400, 'Invalid verified filter.')
    const sort = url.searchParams.get('sort')
    if (sort && !['price-asc', 'price-desc', 'level'].includes(sort)) throw fail(400, 'Select a supported sort order.')
    if (game && game !== 'all') accounts = accounts.filter((account) => account.gameKey === game)
    if (verified === 'true') accounts = accounts.filter((account) => account.isVerified)
    if (Number.isFinite(maxPrice)) accounts = accounts.filter((account) => account.price <= maxPrice)
    if (query) accounts = accounts.filter((account) =>
      `${account.title} ${account.game} ${account.rank} ${account.description}`.toLowerCase().includes(query))
    if (sort === 'price-asc') accounts.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') accounts.sort((a, b) => b.price - a.price)
    if (sort === 'level') accounts.sort((a, b) => b.level - a.level)
    return json(response, 200, { accounts: accounts.map(publicAccount), total: accounts.length })
  }
  if (/^\/api\/accounts\/[^/]+\/messages$/.test(pathname)) {
    const user = await authenticatedUser(request, store, response)
    const accountId = decodeURIComponent(pathname.split('/')[3])
    const account = store.accounts.find((item) => item.id === accountId && item.status === 'active')
    if (!account) throw fail(404, 'Account not found.')
    if (method === 'GET') {
      return json(response, 200, {
        messages: store.messages.filter((message) => message.accountId === accountId && (
          message.userId === user.id || account.ownerId === user.id
        )),
      })
    }
    if (method === 'POST') {
      const message = {
        id: randomUUID(),
        userId: user.id,
        accountId,
        sender: 'user',
        text: validText(body.text, 'Message', 2000),
        timestamp: new Date().toISOString(),
      }
      store.messages.push(message)
      store.notifications.unshift({
        id: randomUUID(),
        userId: user.id,
        title: `Question about ${account.title}`,
        message: 'Your message has been sent to DrukGG support for seller follow-up.',
        timestamp: message.timestamp,
        unread: false,
        type: 'chat',
      })
      await saveStore(store)
      return json(response, 201, { message })
    }
  }
  if (method === 'GET' && pathname.startsWith('/api/accounts/')) {
    const account = store.accounts.find((item) => item.id === decodeURIComponent(pathname.slice('/api/accounts/'.length)) && item.status === 'active')
    if (!account) throw fail(404, 'Account not found.')
    return json(response, 200, { account: publicAccount(account) })
  }
  if (method === 'GET' && pathname === '/api/notifications') {
    const user = await authenticatedUser(request, store, response)
    return json(response, 200, { notifications: store.notifications.filter((notice) => notice.userId === user.id) })
  }
  if (method === 'POST' && pathname === '/api/notifications/read') {
    const user = await authenticatedUser(request, store, response)
    store.notifications.forEach((notice) => {
      if (notice.userId === user.id) notice.unread = false
    })
    await saveStore(store)
    return json(response, 200, { ok: true })
  }
  if (method === 'GET' && pathname === '/api/messages') {
    const user = await authenticatedUser(request, store, response)
    return json(response, 200, { messages: store.messages.filter((message) => message.userId === user.id) })
  }
  if (method === 'POST' && pathname === '/api/messages') {
    const user = await authenticatedUser(request, store, response)
    const message = {
      id: randomUUID(),
      userId: user.id,
      sender: 'user',
      text: validText(body.text, 'Message', 2000),
      timestamp: new Date().toISOString(),
    }
    store.messages.push(message)
    store.notifications.unshift({
      id: randomUUID(),
      userId: user.id,
      title: 'Message sent to DrukGG Support',
      message: message.text,
      timestamp: message.timestamp,
      unread: false,
      type: 'chat',
    })
    await saveStore(store)
    return json(response, 201, { message })
  }
  if (method === 'GET' && pathname === '/api/orders') {
    const user = await authenticatedUser(request, store, response)
    return json(response, 200, { orders: store.orders.filter((order) => order.buyerId === user.id) })
  }
  if (method === 'POST' && pathname === '/api/orders') {
    const user = await authenticatedUser(request, store, response)
    const account = store.accounts.find((item) => item.id === body.accountId && item.status === 'active')
    if (!account) throw fail(404, 'This account is no longer available.')
    if (account.ownerId === user.id) throw fail(400, 'You cannot purchase your own account.')
    const paymentMethods = ['bank', 'ewallet', 'other']
    if (!paymentMethods.includes(body.paymentMethod)) throw fail(400, 'Select a valid payment method.')
    const orderNumber = `#${String(Date.now()).slice(-8)}`
    const order = {
      id: randomUUID(),
      orderNumber,
      accountId: account.id,
      accountTitle: account.title,
      game: account.game,
      price: account.price,
      platformFee,
      total: account.price + platformFee,
      paymentMethod: body.paymentMethod,
      paymentStatus: 'pending',
      status: 'Processing',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      image: account.image,
      buyerId: user.id,
      sellerId: account.ownerId,
    }
    store.orders.unshift(order)
    store.escrows.unshift({
      id: randomUUID(),
      orderNumber,
      accountTitle: account.title,
      buyerName: user.name,
      sellerName: account.seller.name,
      amount: order.total,
      platformFee,
      sellerPayout: account.price,
      bankRef: '',
      paymentMethod: body.paymentMethod,
      status: 'payment_pending',
      initiatedAt: new Date().toISOString(),
    })
    store.notifications.unshift({
      id: randomUUID(),
      userId: user.id,
      title: 'Order Placed',
      message: `Order ${orderNumber} for ${account.title} is awaiting payment verification.`,
      timestamp: new Date().toISOString(),
      unread: true,
      type: 'escrow',
      relatedId: order.id,
    })
    await saveStore(store)
    return json(response, 201, { order })
  }
  if (method === 'GET' && pathname === '/api/listings') {
    const user = await authenticatedUser(request, store, response)
    const listings = store.submissions.filter((item) => item.userId === user.id).map((item) => ({
      id: item.id,
      listingCode: item.submissionCode,
      title: item.title,
      game: item.game,
      price: item.price,
      dateListed: new Date(item.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: item.status === 'approved' ? 'Active' : item.status === 'rejected' ? 'Rejected' : 'Under Review',
      viewsCount: 0,
      offersCount: 0,
      image: item.image,
      rank: item.rank,
      level: item.level,
      payoutStatus: item.status === 'approved' ? 'Active on Marketplace' : item.status === 'rejected' ? item.rejectionReason : 'Admin Verification',
      payoutAccount: item.sellerBank || 'Not provided',
    }))
    return json(response, 200, { listings })
  }
  if (method === 'PATCH' && /^\/api\/listings\/[^/]+$/.test(pathname)) {
    const user = await authenticatedUser(request, store, response)
    const id = decodeURIComponent(pathname.split('/')[3])
    const submission = store.submissions.find((item) => item.id === id && item.userId === user.id)
    if (!submission) throw fail(404, 'Listing not found.')
    const price = Number(body.price)
    if (!Number.isInteger(price) || price < 1 || price > 100000000) throw fail(400, 'Enter a valid selling price.')
    submission.price = price
    const account = store.accounts.find((item) => item.id === `account-${id}`)
    if (account) account.price = price
    await saveStore(store)
    return json(response, 200, { submission })
  }
  if (method === 'POST' && pathname === '/api/submissions') {
    const user = await authenticatedUser(request, store, response)
    const game = validText(body.game, 'Game', 50)
    const level = Number(validText(String(body.level ?? ''), 'Level', 10))
    const skinsCount = Number(validText(String(body.skinsCount ?? ''), 'Skin count', 10))
    const price = Number(body.price)
    if (!Number.isInteger(level) || level < 1 || level > 10000 || !Number.isInteger(skinsCount) || skinsCount < 0 || skinsCount > 10000) {
      throw fail(400, 'Level must be positive, and skin count must be a non-negative whole number.')
    }
    if (!Number.isInteger(price) || price < 1 || price > 100000000) throw fail(400, 'Enter a valid selling price.')
    const title = validText(body.title || `${game} Account`, 'Account title', 100)
    const imageKey = { 'Mobile Legends': 'mlbb', eFootball: 'efootball', PUBG: 'pubg', 'PUBG Mobile': 'pubg', 'Free Fire': 'freefire', Valorant: 'mlbb' }[game]
    if (!imageKey) throw fail(400, 'Select a supported game.')
    const image = `/images/drukgg_${imageKey}_account_${{ mlbb: '1790787283536', efootball: '1790787296966', pubg: '1790787311472', freefire: '1790787323353' }[imageKey]}.jpg`
    const bankAccount = body.bankAccount === undefined || body.bankAccount === ''
      ? ''
      : validText(body.bankAccount, 'Bank account', 40)
    const bankDigits = bankAccount.replace(/\D/g, '')
    if (bankAccount && (!/^[\d\s+-]+$/.test(bankAccount) || bankDigits.length < 4 || bankDigits.length > 34)) {
      throw fail(400, 'Enter a valid payout account number.')
    }
    const phone = body.phone === undefined || body.phone === ''
      ? ''
      : validText(body.phone, 'Phone number', 40)
    const submission = {
      id: randomUUID(),
      submissionCode: `#SUB-${String(Date.now()).slice(-6)}`,
      userId: user.id,
      sellerName: user.name,
      sellerPhone: phone ? `Phone ending ${phone.replace(/\D/g, '').slice(-4)}` : '',
      sellerCid: '',
      sellerBank: bankAccount
        ? `Account ending ${bankDigits.slice(-4)}`
        : 'Not provided',
      game,
      title,
      rank: validText(body.rank, 'Rank', 80),
      level,
      skinsCount,
      server: validText(body.server, 'Server', 80),
      price,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      image,
      description: validText(body.description, 'Description', 1500),
    }
    store.submissions.unshift(submission)
    store.notifications.unshift({
      id: randomUUID(),
      userId: user.id,
      title: 'Account Submission Received',
      message: `${submission.title} is awaiting DrukGG review.`,
      timestamp: submission.submittedAt,
      unread: true,
      type: 'approval',
      relatedId: submission.id,
    })
    await saveStore(store)
    return json(response, 201, { submission })
  }
  if (pathname.startsWith('/api/admin/')) {
    const admin = await authenticatedUser(request, store, response, 'admin')
    const adminPath = pathname.slice('/api/admin'.length)
    if (method === 'GET' && adminPath === '/submissions') return json(response, 200, { submissions: store.submissions })
    if (method === 'PATCH' && /^\/submissions\/[^/]+$/.test(adminPath)) {
      const id = decodeURIComponent(adminPath.split('/')[2])
      const submission = store.submissions.find((item) => item.id === id)
      if (!submission) throw fail(404, 'Submission not found.')
      if (!['approved', 'rejected'].includes(body.status)) throw fail(400, 'Choose approved or rejected.')
      submission.status = body.status
      if (body.status === 'rejected') submission.rejectionReason = validText(body.rejectionReason, 'Rejection reason', 500)
      if (body.status === 'approved' && !store.accounts.some((account) => account.id === `account-${submission.id}`)) {
        store.accounts.unshift(submissionAccount(submission, store.users.find((user) => user.id === submission.userId)))
      }
      store.notifications.unshift({
        id: randomUUID(),
        userId: submission.userId,
        title: body.status === 'approved' ? 'Account Submission Approved' : 'Account Submission Rejected',
        message: body.status === 'approved'
          ? `${submission.title} is now listed in the marketplace.`
          : `Your submission was rejected: ${submission.rejectionReason}`,
        timestamp: new Date().toISOString(),
        unread: true,
        type: 'approval',
      })
      await saveStore(store)
      return json(response, 200, { submission })
    }
    if (method === 'DELETE' && /^\/submissions\/[^/]+$/.test(adminPath)) {
      const id = decodeURIComponent(adminPath.split('/')[2])
      store.submissions = store.submissions.filter((item) => item.id !== id)
      await saveStore(store)
      return json(response, 200, { ok: true })
    }
    if (method === 'GET' && adminPath === '/accounts') {
      return json(response, 200, { accounts: store.accounts.map(publicAccount) })
    }
    if (method === 'DELETE' && /^\/accounts\/[^/]+$/.test(adminPath)) {
      const id = decodeURIComponent(adminPath.split('/')[2])
      store.accounts = store.accounts.filter((item) => item.id !== id)
      await saveStore(store)
      return json(response, 200, { ok: true })
    }
    if (method === 'GET' && adminPath === '/orders') return json(response, 200, { orders: store.orders })
    if (method === 'GET' && adminPath === '/conversations') {
      const usersWithMessages = [...new Set([
        ...store.messages.map((message) => message.userId),
        ...store.submissions.map((submission) => submission.userId),
        ...store.orders.map((order) => order.buyerId),
      ])]
      const conversations = usersWithMessages.map((userId) => {
        const messages = store.messages.filter((message) => message.userId === userId)
        const conversationUser = store.users.find((user) => user.id === userId)
        const lastMessage = messages[messages.length - 1]
        const submission = store.submissions.find((item) => item.userId === userId)
        const order = store.orders.find((item) => item.buyerId === userId)
        return {
          id: userId,
          userId,
          userName: conversationUser?.name || 'Marketplace user',
          userInitials: (conversationUser?.name || 'MU').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
          userPhone: conversationUser?.phone || '',
          activeContext: lastMessage?.accountId
            ? `Account inquiry · ${store.accounts.find((account) => account.id === lastMessage.accountId)?.title || 'Account'}`
            : submission
              ? `Submission ${submission.submissionCode}`
              : order
                ? `Order ${order.orderNumber}`
                : 'DrukGG Support',
          lastMessage: lastMessage?.text || '',
          lastMessageTime: lastMessage?.timestamp || '',
          unreadCount: 0,
          messages,
        }
      })
      return json(response, 200, { conversations })
    }
    if (method === 'POST' && /^\/conversations\/[^/]+\/messages$/.test(adminPath)) {
      const userId = decodeURIComponent(adminPath.split('/')[2])
      const message = {
        id: randomUUID(),
        userId,
        sender: 'admin',
        text: validText(body.text, 'Message', 2000),
        timestamp: new Date().toISOString(),
        adminName: admin.name,
        adminRole: 'DrukGG Administrator',
      }
      store.messages.push(message)
      store.notifications.unshift({
        id: randomUUID(),
        userId,
        title: 'New message from DrukGG Support',
        message: message.text,
        timestamp: message.timestamp,
        unread: true,
        type: 'chat',
      })
      await saveStore(store)
      return json(response, 201, { message })
    }
    if (method === 'GET' && adminPath === '/escrows') return json(response, 200, { escrows: store.escrows })
    if (method === 'PATCH' && /^\/escrows\/[^/]+$/.test(adminPath)) {
      const id = decodeURIComponent(adminPath.split('/')[2])
      const escrow = store.escrows.find((item) => item.id === id)
      if (!escrow) throw fail(404, 'Escrow transaction not found.')
      if (!['held_in_escrow', 'payout_released'].includes(body.status)) throw fail(400, 'Unsupported escrow status.')
      if (body.status === 'payout_released' && escrow.status !== 'held_in_escrow') {
        throw fail(409, 'Payment must be confirmed before a payout can be released.')
      }
      escrow.status = body.status
      if (body.status === 'payout_released') {
        const order = store.orders.find((item) => item.orderNumber === escrow.orderNumber)
        if (order) {
          order.status = 'Completed'
          order.paymentStatus = 'paid'
        }
      }
      await saveStore(store)
      return json(response, 200, { escrow })
    }
    return json(response, 404, { error: 'Admin endpoint not found.' })
  }
  return json(response, 404, { error: 'Endpoint not found.' })
}

export async function handleApiRequest(request, response) {
  const requestId = randomUUID()
  const secureRequest = isSecureRequest(request)
  if (secureRequest) response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  if (process.env.NODE_ENV === 'production' && !secureRequest) {
    json(response, 426, { error: 'HTTPS is required for production requests.' })
    return
  }

  try {
    enforceAuthRateLimit(request)
    await handle(request, response)
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error)
      return
    }
    const status = Number.isInteger(error.status) ? error.status : 500
    if (status >= 500) {
      logError('api_request_failed', {
        requestId,
        method: request.method,
        path: new URL(request.url, 'http://localhost').pathname,
        status,
        errorName: error.name,
      })
    }
    json(response, status, {
      error: status === 500 ? 'An unexpected server error occurred.' : error.message,
      ...(status >= 500 ? { requestId } : {}),
    })
  }
}

export function startApiServer(server) {
  server.on('error', (error) => {
    console.error(`Could not start DrukGG API on port ${port}: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, () => {
  console.log(`DrukGG API listening on http://localhost:${port}`)
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn('Admin sign-in is disabled until ADMIN_EMAIL and ADMIN_PASSWORD are configured.')
  }
  })
}
