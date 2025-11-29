/** App Component - Main application with routing/layout logic only. Requirements: 1.3 */
import { useState } from 'react';
import { ErrorBoundary, ThemeToggle } from './components/ui';
import { ResumeSelectionPage, ResumeEditPage } from './pages';
import { useResumeData, useResumeSelection, useTemplateConfig, useResumeMetadata, useToast, useTheme } from './hooks';
import { resumeApi } from './services/api';
import user from './user.json';
import './App.css';

function ResumeApp(): React.ReactElement {
  const { resumes, templates, isLoading, error, refetch } = useResumeData([user as never]);
  const { selectedResumeId, selectResume, resetSelection, getSelectedResume } = useResumeSelection();
  const { selectedTemplate, sectionOrder, order, setSelectedTemplate, moveSectionUp, moveSectionDown } = useTemplateConfig(templates);
  const { keywords, resumeName, setKeywords, setResumeName, initializeFromResume } = useResumeMetadata();
  const { toasts, showToast, dismissToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false), [isSaving, setIsSaving] = useState(false);

  const handleSelectResume = (id: string) => {
    selectResume(id);
    const resume = resumes.find(r => r._id === id);
    if (resume) { initializeFromResume(resume.keywords, resume.name); setIsEditing(true); }
  };
  const handleCreateNew = () => { resetSelection(); initializeFromResume([], ''); setIsEditing(true); };
  const handleSubmit = async (data: Record<string, unknown>, saveAsNew: boolean) => {
    setIsSaving(true);
    try {
      const payload = { ...data, name: resumeName, keywords };
      if (selectedResumeId && !saveAsNew) await resumeApi.update(selectedResumeId, payload as never);
      else await resumeApi.create(payload as never);
      showToast('Resume saved successfully!'); refetch();
    } catch (err) {
      console.error('Save error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Failed to save: ${message}`, true);
    } finally { setIsSaving(false); }
  };
  const handleDownload = async () => {
    try {
      const response = await resumeApi.download(selectedResumeId, selectedTemplate, order);
      if (!response.ok) throw new Error();
      const blob = await response.blob(), url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = `${resumeName}.pdf`; link.click(); showToast('Resume downloaded!');
    } catch { showToast('Failed to download', true); }
  };
  const handleCopy = async () => {
    try {
      const data = await resumeApi.copy(selectedResumeId, selectedTemplate, order);
      navigator.clipboard.writeText(data.resume); showToast('Copied to clipboard!');
    } catch { showToast('Failed to copy', true); }
  };

  if (isLoading) return <><ThemeToggle isDark={isDark} onToggle={toggleTheme} /><div className="panel panel-default panel-body resume-panel"><p>Loading...</p></div></>;
  if (!isEditing) return <><ThemeToggle isDark={isDark} onToggle={toggleTheme} /><ResumeSelectionPage resumes={resumes} isLoading={isLoading} error={error} selectedResumeId={selectedResumeId} onSelectResume={handleSelectResume} onCreateNew={handleCreateNew} onRetry={refetch} toasts={toasts} onDismissToast={dismissToast} /></>;
  return <><ThemeToggle isDark={isDark} onToggle={toggleTheme} /><ResumeEditPage resumes={resumes} resume={getSelectedResume(resumes)} selectedResumeId={selectedResumeId} templates={templates} selectedTemplate={selectedTemplate} sectionOrder={sectionOrder} keywords={keywords} resumeName={resumeName} isSaving={isSaving} toasts={toasts} onSubmit={handleSubmit} onDownload={handleDownload} onCopy={handleCopy} onTemplateChange={setSelectedTemplate} onSectionUp={moveSectionUp} onSectionDown={moveSectionDown} onKeywordsChange={setKeywords} onNameChange={setResumeName} onSelectResume={handleSelectResume} onResetSelection={() => { resetSelection(); initializeFromResume([], ''); }} onDismissToast={dismissToast} /></>;
}

export default function App(): React.ReactElement { return <ErrorBoundary><ResumeApp /></ErrorBoundary>; }
