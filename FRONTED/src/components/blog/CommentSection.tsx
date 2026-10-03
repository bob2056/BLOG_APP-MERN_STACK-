'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Comment } from '@/types';
import { commentService } from '@/services/comment.service';
import { useAuth } from '@/context/AuthContext';
import { formatDate, getMediaUrl } from '@/lib/utils';
import { MessageSquare, Reply, Edit2, Trash2, Send, CornerDownRight } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, isAdmin } = useAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await commentService.getPostComments(postId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Submit top-level comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await commentService.createComment(postId, { content: content.trim() });
      if (res.success && res.data) {
        setContent('');
        fetchComments();
      }
    } catch (err) {
      console.error('Error creating comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply
  const handleAddReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await commentService.createComment(postId, {
        content: replyContent.trim(),
        parentComment: parentCommentId,
      });
      if (res.success) {
        setReplyingToId(null);
        setReplyContent('');
        fetchComments();
      }
    } catch (err) {
      console.error('Error creating reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await commentService.updateComment(commentId, { content: editContent.trim() });
      setEditingId(null);
      fetchComments();
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-indigo-600" />
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Add Top-Level Comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            <textarea
              rows={3}
              placeholder="What are your thoughts on this article?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none border-none bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2">
              <span className="text-xs text-slate-400">Markdown supported</span>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Post Comment</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center mb-8">
          <p className="text-sm text-slate-600">
            Have something to say?{' '}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </Link>{' '}
            or{' '}
            <Link href="/auth/register" className="font-semibold text-indigo-600 hover:underline">
              create an account
            </Link>{' '}
            to join the discussion.
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="h-4 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          No comments yet. Be the first to share your perspective!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => {
            const isCommentOwner = user && (user._id === comment.author?._id || isAdmin);

            return (
              <div key={comment._id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                {/* Comment Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {comment.author?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getMediaUrl(comment.author.avatar)}
                        alt={comment.author.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {comment.author?.name ? comment.author.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/profile/${comment.author?.username}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {comment.author?.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                        {comment.isEdited && <span>(edited)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit / Delete */}
                  {isCommentOwner && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditContent(comment.content);
                        }}
                        className="p-1 hover:text-slate-600 transition-colors"
                        title="Edit comment"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1 hover:text-rose-600 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content or Edit Form */}
                {editingId === comment._id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      rows={2}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}

                {/* Reply trigger button */}
                {user && (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setReplyingToId(replyingToId === comment._id ? null : comment._id);
                        setReplyContent('');
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                )}

                {/* Reply Input Form */}
                {replyingToId === comment._id && (
                  <div className="mt-3 pl-4 border-l-2 border-indigo-200 space-y-2">
                    <textarea
                      rows={2}
                      placeholder={`Reply to ${comment.author?.name}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setReplyingToId(null)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        disabled={!replyContent.trim() || isSubmitting}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies Rendering */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 sm:pl-6 border-l-2 border-slate-100">
                    {comment.replies.map((reply) => {
                      const isReplyOwner = user && (user._id === reply.author?._id || isAdmin);

                      return (
                        <div key={reply._id} className="rounded-lg bg-slate-50 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="h-3.5 w-3.5 text-indigo-400" />
                              <Link
                                href={`/profile/${reply.author?.username}`}
                                className="text-xs font-semibold text-slate-900 hover:text-indigo-600"
                              >
                                {reply.author?.name}
                              </Link>
                              <time className="text-xs text-slate-400">
                                {formatDate(reply.createdAt)}
                              </time>
                            </div>

                            {isReplyOwner && (
                              <button
                                onClick={() => handleDeleteComment(reply._id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                title="Delete reply"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 pl-5">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
