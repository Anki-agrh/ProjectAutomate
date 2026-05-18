import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, UserPlus, UploadCloud, Loader2, Download, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { addEmployee, uploadEmployeesCsv } from '../../api';
import { useTheme } from '../../context/ThemeContext';

const OnboardModal = ({ isOpen, onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const [tab, setTab] = useState('manual'); // 'manual' or 'csv'
  const [loading, setLoading] = useState(false);

  // Manual Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('Engineering');
  const [experience, setExperience] = useState(3);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);

  // CSV Form State
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset state
    setName(''); setEmail(''); setDomain('Engineering'); setExperience(3);
    setSkillInput(''); setSkills([]); setFile(null);
    onClose();
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      e.preventDefault();
      const s = skillInput.trim();
      if (s && !skills.includes(s)) {
        setSkills([...skills, s]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const submitManual = async (e) => {
    e.preventDefault();
    if (skills.length === 0) {
      toast.error('Please add at least one skill.');
      return;
    }
    setLoading(true);
    try {
      const res = await addEmployee({
        name,
        email,
        role: 'employee',
        domain,
        experience,
        skills
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        onSuccess();
        handleClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to onboard employee.');
    } finally {
      setLoading(false);
    }
  };

  const submitCsv = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadEmployeesCsv(formData);
      if (res.data.status === 'success') {
        toast.success(`Successfully onboarded ${res.data.created} employees. (Skipped ${res.data.skipped} duplicates)`);
        onSuccess();
        handleClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to process CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        toast.error('Only CSV files are allowed.');
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,email,role,domain,skills,experience\nJohn Doe,john@scrummaster.com,employee,Engineering,\"React, Node.js, TypeScript\",5\nJane Smith,jane@scrummaster.com,employee,Design,\"UI/UX, Figma\",3";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scrummaster_onboarding_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border ${
          isDark ? 'bg-cyber-dark border-white/10' : 'bg-white border-slate-200'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-primary/15 flex items-center justify-center text-cyber-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Onboard Personnel</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add new members to your organization</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-6 pt-4 gap-4 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
          {[
            { id: 'manual', label: 'Manual Entry', icon: UserPlus },
            { id: 'csv', label: 'Bulk CSV Upload', icon: UploadCloud }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 pb-3 px-2 border-b-2 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? 'border-cyber-primary text-cyber-primary'
                  : isDark
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {tab === 'manual' ? (
              <motion.form
                key="manual"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={submitManual}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                    <input type="text" required className="input-base" placeholder="e.g. Jane Doe" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                    <input type="email" required className="input-base" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Domain / Department</label>
                    <select required className="input-base appearance-none" value={domain} onChange={e => setDomain(e.target.value)}>
                      {['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'General'].map(d => (
                        <option key={d} value={d} className={isDark ? "bg-cyber-dark" : ""}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Years Experience</label>
                    <input type="number" min="0" max="50" required className="input-base" value={experience} onChange={e => setExperience(parseInt(e.target.value))} />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Skills (Press Enter)</label>
                  <div className={`p-2 rounded-xl border flex flex-wrap gap-2 transition-colors ${
                    isDark ? 'bg-white/[0.02] border-white/10 focus-within:border-cyber-primary' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-400'
                  }`}>
                    {skills.map(s => (
                      <span key={s} className="flex items-center gap-1 bg-cyber-primary/20 text-cyber-primary px-2.5 py-1 rounded-md text-xs font-medium">
                        {s}
                        <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-white transition-colors">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1"
                      placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      onBlur={handleAddSkill}
                    />
                  </div>
                </div>

                <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${isDark ? 'bg-cyber-primary/[0.06] border border-cyber-primary/10 text-slate-400' : 'bg-indigo-50 border border-indigo-100 text-slate-600'}`}>
                  <AlertCircle size={14} className="text-cyber-primary mt-0.5 shrink-0" />
                  <span>The employee will be created in a <strong>passwordless state</strong> for immediate task assignment. They cannot log in until activation is configured.</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading} className="btn-primary py-2.5 px-6">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                    {loading ? 'Onboarding...' : 'Onboard Employee'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="csv"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Upload a CSV file to bulk onboard your organization's roster.</p>
                  <button onClick={downloadTemplate} className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}>
                    <Download size={14} /> Template
                  </button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
                    file 
                      ? (isDark ? 'border-cyber-primary bg-cyber-primary/5' : 'border-indigo-400 bg-indigo-50')
                      : (isDark ? 'border-white/20 hover:border-white/40 hover:bg-white/[0.02]' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50')
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                  
                  {file ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                        <FileText size={32} className="text-emerald-500" />
                      </div>
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{file.name}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs text-rose-500 mt-4 hover:underline"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        isDark ? 'bg-white/5' : 'bg-slate-100'
                      }`}>
                        <UploadCloud size={32} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
                      </div>
                      <p className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Click to upload or drag and drop</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CSV files only. Maximum file size 5MB.</p>
                    </>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={submitCsv}
                    disabled={!file || loading} 
                    className="btn-primary py-2.5 px-6 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                    {loading ? 'Processing CSV...' : 'Process Batch Upload'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardModal;
