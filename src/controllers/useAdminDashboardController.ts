import { useCallback, useEffect, useState } from 'react';
import { AdminConversation, EscrowTransaction, GameAccount, ListingSubmission } from '../models/marketplace';
import {
  deleteAccount,
  deleteSubmission,
  getAdminDashboardData,
  reviewSubmission,
  sendAdminMessage,
  updateEscrowStatus,
} from '../models/adminModel';

export function useAdminDashboardController() {
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([]);
  const [liveAccounts, setLiveAccounts] = useState<GameAccount[]>([]);
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [replyText, setReplyText] = useState('');
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [pageError, setPageError] = useState('');

  const loadAdminData = useCallback(async () => {
    try {
      const [submissionResult, accountResult, conversationResult, escrowResult] = await getAdminDashboardData();
      setSubmissions(submissionResult.submissions);
      setLiveAccounts(accountResult.accounts);
      setConversations(conversationResult.conversations);
      setEscrows(escrowResult.escrows);
      setSelectedConversationId((current) => current || conversationResult.conversations[0]?.id || '');
      setPageError('');
    } catch (error) {
      setPageError(error.message);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminDashboardData().then(([submissionResult, accountResult, conversationResult, escrowResult]) => {
      if (!active) return;
      setSubmissions(submissionResult.submissions);
      setLiveAccounts(accountResult.accounts);
      setConversations(conversationResult.conversations);
      setEscrows(escrowResult.escrows);
      setSelectedConversationId((current) => current || conversationResult.conversations[0]?.id || '');
    }).catch((error) => {
      if (active) setPageError(error.message);
    });
    return () => { active = false; };
  }, []);

  const handleApproveSubmission = async (id: string) => {
    try {
      await reviewSubmission(id, 'approved');
      await loadAdminData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleRejectSubmission = async (id: string, reason: string) => {
    try {
      await reviewSubmission(id, 'rejected', reason);
      await loadAdminData();
      return true;
    } catch (error) {
      setPageError(error.message);
      return false;
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await deleteSubmission(id);
      await loadAdminData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleDeleteLiveListing = async (id: string) => {
    try {
      await deleteAccount(id);
      await loadAdminData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleSendAdminReply = async (userId: string) => {
    if (!replyText.trim() || !userId) return;
    try {
      await sendAdminMessage(userId, replyText);
      setReplyText('');
      await loadAdminData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleReleasePayout = async (escrowId: string) => {
    try {
      await updateEscrowStatus(escrowId, 'payout_released');
      await loadAdminData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  const handleConfirmFundsReceived = async (escrowId: string) => {
    try {
      await updateEscrowStatus(escrowId, 'held_in_escrow');
      await loadAdminData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  return {
    submissions,
    liveAccounts,
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    replyText,
    setReplyText,
    escrows,
    pageError,
    setPageError,
    loadAdminData,
    handleApproveSubmission,
    handleRejectSubmission,
    handleDeleteSubmission,
    handleDeleteLiveListing,
    handleSendAdminReply,
    handleReleasePayout,
    handleConfirmFundsReceived,
  };
}
