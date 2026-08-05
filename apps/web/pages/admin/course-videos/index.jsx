/**
 * @fileoverview Admin Course Videos Page
 * Manage landing page course intro/overview recordings.
 * Full CRUD with drag-and-drop reorder, add, edit, delete.
 * Auto-fetches YouTube video title when URL is pasted.
 * Live preview of how the card will look on the landing page.
 * New videos automatically appear at the top.
 * 
 * Path: apps/web/pages/admin/course-videos/index.jsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Video, Plus, Edit, Trash2, Search, X, Save, Eye, Loader, Play, Clock, ExternalLink, GripVertical } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const extractYouTubeId = (input) => {
  if (!input) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  return input;
};

const getThumbnailUrl = (videoId) => {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const AdminCourseVideosPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [formData, setFormData] = useState({ youtubeId: '', title: '', duration: '', thumbnail: '' });
  const dragItem = useRef(null);

  const previewVideoId = extractYouTubeId(formData.youtubeId);
  const previewThumbnail = formData.thumbnail || getThumbnailUrl(previewVideoId);
  const previewTitle = formData.title || '(Video title will appear here)';
  const previewDuration = formData.duration || '';

  const fetchVideos = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/course-videos');
      if (response && response.success) setVideos(response.data || []);
    } catch (err) {
      if (err?.response?.status === 401) router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleYoutubeIdChange = async (value) => {
    setFormData((prev) => ({ ...prev, youtubeId: value }));
    const videoId = extractYouTubeId(value);
    if (videoId && videoId.length === 11 && !formData.title) {
      setFetchingTitle(true);
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setFormData((prev) => ({ ...prev, title: data.title, thumbnail: prev.thumbnail || getThumbnailUrl(videoId) }));
          }
        }
      } catch { /* silent */ }
      finally { setFetchingTitle(false); }
    }
  };

  const handleAdd = () => { setEditingVideo(null); setFormData({ youtubeId: '', title: '', duration: '', thumbnail: '' }); setShowModal(true); };
  const handleEdit = (video) => { setEditingVideo(video); setFormData({ youtubeId: video.youtube_id || '', title: video.title || '', duration: video.duration || '', thumbnail: video.thumbnail || '' }); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditingVideo(null); };

  const handleChange = (field, value) => {
    if (field === 'youtubeId') handleYoutubeIdChange(value);
    else setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.youtubeId.trim() || !formData.title.trim()) { toast.error('YouTube URL and Title are required.'); return; }
    setSaving(true);
    try {
      if (editingVideo) {
        const response = await apiClient.put(`/admin/course-videos/${editingVideo.id}`, formData);
        if (response && response.success) { toast.success('Video updated.'); fetchVideos(); handleCloseModal(); }
        else toast.error(response?.message || 'Failed to update video.');
      } else {
        const response = await apiClient.post('/admin/course-videos', formData);
        if (response && response.success) { toast.success('Video created.'); fetchVideos(); handleCloseModal(); }
        else toast.error(response?.message || 'Failed to create video.');
      }
    } catch (err) { toast.error('Failed to save video.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Delete this video?')) return;
    try {
      const response = await apiClient.delete(`/admin/course-videos/${videoId}`);
      if (response && response.success) { toast.success('Video deleted.'); fetchVideos(); }
      else toast.error(response?.message || 'Failed to delete video.');
    } catch (err) { toast.error('Failed to delete video.'); }
  };

  const handleDragStart = (e, index) => { dragItem.current = index; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { e.target.style.opacity = '0.4'; }, 0); };
  const handleDragEnter = (e) => { e.preventDefault(); };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = async (e, index) => {
    e.preventDefault();
    const draggedIndex = dragItem.current;
    if (draggedIndex === null || draggedIndex === index) return;
    const updatedVideos = [...videos];
    const [removed] = updatedVideos.splice(draggedIndex, 1);
    updatedVideos.splice(index, 0, removed);
    setVideos(updatedVideos);
    dragItem.current = null;
    setReordering(true);
    try {
      await apiClient.post('/admin/course-videos/reorder-bulk', { videos: updatedVideos.map((v, i) => ({ id: v.id, sortOrder: i })) });
    } catch (err) { toast.error('Failed to save order.'); fetchVideos(); }
    finally { setReordering(false); }
  };

  const handleDragEnd = (e) => { e.target.style.opacity = '1'; dragItem.current = null; };

  const getListThumbnail = (youtubeId) => {
    if (!youtubeId) return '';
    const id = extractYouTubeId(youtubeId);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
  };

  const filteredVideos = videos.filter((v) => {
    if (!searchTerm) return true;
    return v.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <SEOHead title="Course Videos" />
      <AdminLayout title="Course Videos" subtitle="Manage course intro & overview recordings — drag to reorder">
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title..." />
          </div>
          <button className="admin-toolbar-btn" onClick={handleAdd}><Plus size={16} /><span>Add New Video</span></button>
        </div>

        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}><div className="spinner-circle" /></div>
        ) : filteredVideos.length > 0 ? (
          <div className="admin-table-wrapper">
            {reordering && (
              <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving new order...
              </div>
            )}
            {filteredVideos.map((video, index) => (
              <div key={video.id} className="admin-table-row" draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} onDragEnd={handleDragEnd} style={{ cursor: 'grab', transition: 'opacity 0.2s ease', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  <div style={{ color: 'var(--text-dim)', cursor: 'grab', flexShrink: 0 }}><GripVertical size={18} /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', minWidth: '20px', textAlign: 'center', flexShrink: 0 }}>{index + 1}</span>
                  <div style={{ width: '80px', height: '45px', borderRadius: '0.375rem', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                    <img src={getListThumbnail(video.youtube_id)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                  </div>
                  <div className="admin-table-info" style={{ flex: 1 }}>
                    <div className="admin-table-info-top">
                      <Video size={14} style={{ color: '#3b82f6' }} />
                      <span className="admin-table-name">{video.title}</span>
                    </div>
                    <p className="admin-table-meta">{video.duration && `${video.duration} · `}{video.youtube_id?.substring(0, 30)}...</p>
                  </div>
                </div>
                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-action-btns">
                    <button className="admin-action-btn view" title="Edit" onClick={() => handleEdit(video)}><Edit size={16} /></button>
                    <button className="admin-action-btn reject" title="Delete" onClick={() => handleDelete(video.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Video size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3 className="empty-state-title">Course Videos</h3>
            <p className="empty-state-desc">{searchTerm ? 'No videos match your search.' : 'No course videos yet. Add your first one.'}</p>
          </div>
        )}
      </AdminLayout>

      {showModal && (
        <div className="checkout-modal-overlay" onClick={handleCloseModal}>
          <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '40rem' }}>
            <button className="checkout-modal-close" onClick={handleCloseModal}><X size={20} /></button>
            <div className="checkout-modal-header"><h2 className="checkout-modal-title">{editingVideo ? 'Edit Video' : 'Add Course Video'}</h2></div>
            <div className="checkout-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="profile-form-field">
                    <label>YouTube URL or Video ID</label>
                    <input type="text" value={formData.youtubeId} onChange={(e) => handleChange('youtubeId', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="profile-form-input" />
                    {fetchingTitle && <p style={{ fontSize: '0.6875rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Fetching video title...</p>}
                  </div>
                  <div className="profile-form-field">
                    <label>Title</label>
                    <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Auto-fetched from YouTube" className="profile-form-input" />
                  </div>
                  <div className="profile-form-field">
                    <label>Duration (e.g., 12:30)</label>
                    <input type="text" value={formData.duration} onChange={(e) => handleChange('duration', e.target.value)} placeholder="12:30" className="profile-form-input" />
                  </div>
                  <div className="profile-form-field">
                    <label>Custom Thumbnail URL (optional)</label>
                    <input type="text" value={formData.thumbnail} onChange={(e) => handleChange('thumbnail', e.target.value)} placeholder="Leave empty for auto-generated" className="profile-form-input" />
                  </div>
                  <button type="submit" disabled={saving} className="profile-form-submit"><Save size={16} /><span>{saving ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}</span></button>
                </form>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}><Eye size={14} /> Public Preview</label>
                  <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '0.5rem', overflow: 'hidden', background: '#000' }}>
                      {previewVideoId ? (
                        <img src={previewThumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} onError={(e) => { if (previewVideoId && !e.target.src.includes('mqdefault')) e.target.src = `https://img.youtube.com/vi/${previewVideoId}/mqdefault.jpg`; }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}><Video size={24} /></div>
                      )}
                      {previewVideoId && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}><div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={14} fill="#fff" color="#fff" /></div></div>}
                    </div>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{previewTitle}</h4>
                    {previewDuration && <p style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Clock size={11} />{previewDuration}</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
                      <div style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '2px solid rgba(59, 130, 246, 0.25)', color: '#3b82f6', fontSize: '0.6875rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}><Play size={12} />Watch Now</div>
                      <div style={{ padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '2px solid rgba(148, 163, 184, 0.15)', color: 'var(--text-dim)', fontSize: '0.625rem', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}><ExternalLink size={11} />Open in YouTube</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCourseVideosPage;