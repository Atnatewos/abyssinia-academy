/**
 * @fileoverview Admin Course Videos Page
 *
 * Video management verified against the real schema:
 *   course_videos: id, youtube_id, title, duration, thumbnail,
 *                  sort_order, is_active, created_at
 *
 * There is no phase_number, week_number, class_number, or is_published
 * column. Status is derived from is_active. Sort order shown in meta.
 * YouTube IDs are normalized for preview links.
 *
 * Path: apps/web/pages/admin/course-videos/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Edit, Trash2, Eye, Play, Plus, Clock } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * Extract an 11-character YouTube video ID from various formats.
 * @param {string} raw - Raw youtube_id value
 * @returns {string} Clean ID or original string
 */
const extractYouTubeId = (raw) => {
  if (!raw) return '';
  const match = raw.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  return raw;
};

const AdminCourseVideosPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchVideos = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/course-videos?${params.toString()}`);
      if (response.success) {
        setVideos(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load videos');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load videos');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, router, toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = async (videoId) => {
    try {
      const response = await apiClient.delete(`/admin/course-videos/${videoId}`);
      if (response.success) {
        toast.success(response.message || 'Video deleted successfully');
        setDeleteConfirm(null);
        fetchVideos();
      } else {
        toast.error(response.message || 'Failed to delete video');
      }
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const renderShimmerRow = (index) => (
    <div key={`shimmer-${index}`} className="admin-table-row">
      <div className="admin-table-info">
        <div className="admin-table-info-top">
          <div className="admin-table-avatar video shimmer" />
          <div className="admin-table-name-block">
            <span className="admin-table-name shimmer" style={{ width: '60%', height: '0.875rem' }} />
            <span className="admin-table-sub shimmer" style={{ width: '45%', height: '0.75rem' }} />
          </div>
        </div>
        <p className="admin-table-meta">
          <span className="shimmer" style={{ display: 'inline-block', width: '12rem', height: '0.75rem' }} />
        </p>
      </div>
      <div className="admin-table-actions-wrapper">
        <div className="admin-table-meta-col">
          <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
        </div>
        <div className="admin-table-action-btns">
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Course Videos Management" />
      <AdminLayout
        title={t.admin?.videos?.title || 'Course Videos'}
        subtitle="Manage video content across the curriculum"
      >
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search videos..."
            />
          </div>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            className="admin-toolbar-btn primary"
            onClick={() => router.push('/admin/course-videos/new')}
          >
            <Plus size={16} />
            <span>Add Video</span>
          </button>
        </div>

        {loading ? (
          <div className="admin-table-wrapper">
            {Array.from({ length: 6 }).map((_, i) => renderShimmerRow(i))}
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'all'
                ? 'No videos match your filters.'
                : 'No videos uploaded yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {videos.map((video) => {
              const cleanId = extractYouTubeId(video.youtube_id);
              return (
                <div key={video.id} className="admin-table-row">
                  <div className="admin-table-info">
                    <div className="admin-table-info-top">
                      <div className="admin-table-avatar video">
                        <Play size={16} />
                      </div>
                      <div className="admin-table-name-block">
                        <span className="admin-table-name">{video.title || 'Untitled'}</span>
                        <span className="admin-table-sub">
                          {cleanId ? `YouTube: ${cleanId}` : 'No source'}
                        </span>
                      </div>
                    </div>
                    <p className="admin-table-meta">
                      <Clock size={12} /> {video.duration || '—'} · Sort order: {video.sort_order ?? '—'}
                    </p>
                  </div>

                  <div className="admin-table-actions-wrapper">
                    <div className="admin-table-meta-col">
                      <span className={`status-badge ${video.is_active ? 'approved' : 'pending'}`}>
                        {video.is_active ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="admin-table-action-btns">
                      {cleanId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${cleanId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-action-btn view"
                          title="Preview on YouTube"
                        >
                          <Eye size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => router.push(`/admin/course-videos/${video.id}/edit`)}
                        className="admin-action-btn edit"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(video.id)}
                        className="admin-action-btn reject"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Video?</h3>
              <p>This action cannot be undone. The video will be removed from its course.</p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminCourseVideosPage;