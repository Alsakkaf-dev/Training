import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Flag } from "@phosphor-icons/react";
import { api, formatApiError } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { PageLoader, StarRating, Avatar, Button, Modal, Select, Textarea } from "../../components/ui";

const REPORT_CATEGORIES = [
  ["False_Scam", "Scam / fraud"],
  ["Damaged_Dangerous", "Returned damaged / unsafe"],
  ["Inappropriate_Offensive", "Harassment / offensive"],
  ["Prohibited_Illegal", "Prohibited / illegal conduct"],
  ["Other", "Other"],
];

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState({ report_category: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [modalErr, setModalErr] = useState("");
  const [reportDone, setReportDone] = useState(false);

  useEffect(() => {
    api.get(`/profile/${userId}`).then(({ data }) => setProfile(data));
  }, [userId]);

  const submitReport = async () => {
    setSubmitting(true); setModalErr("");
    try {
      await api.post("/reports/user", { reported_user_id: userId, ...report });
      setReportDone(true);
    } catch (e) {
      setModalErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally { setSubmitting(false); }
  };

  if (!profile) return <PageLoader />;
  const u = profile.user;
  const isSelf = user && user.id === u.id;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted text-sm mb-4 font-medium hover:text-ink transition-colors" data-testid="back-btn"><ArrowLeft size={16} weight="bold" /> Back</button>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-line rounded-4xl p-6 text-center shadow-card" data-testid="public-profile-card">
        <div className="mx-auto w-fit"><Avatar name={u.full_name} src={u.profile_picture} size={84} /></div>
        <h1 className="font-head font-extrabold text-2xl mt-4">{u.full_name}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <StarRating value={u.trust_score} size={18} />
          <span className="font-bold">{Number(u.trust_score).toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted mt-2 inline-flex items-center gap-1.5"><CheckCircle size={15} weight="fill" className="text-emerald-500" /> {profile.completed_transactions} completed exchanges</p>
      </motion.div>

      {!isSelf && (
        <button onClick={() => { setReport({ report_category: "", description: "" }); setReportDone(false); setModalErr(""); setReportOpen(true); }} className="w-full text-sm font-medium text-muted hover:text-status-cancelled flex items-center justify-center gap-1.5 py-3 mt-3 transition-colors" data-testid="report-user-btn">
          <Flag size={15} /> Report this user
        </button>
      )}

      <h3 className="font-head font-bold text-lg mt-4 mb-3">Ratings ({profile.rating_count})</h3>
      {profile.rating_history.length === 0 ? (
        <p className="text-sm text-muted">No ratings yet.</p>
      ) : (
        <div className="space-y-3">
          {profile.rating_history.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border border-line rounded-3xl p-4 bg-surface shadow-card" data-testid={`pub-rating-${i}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink text-sm">{r.rater_name}</span>
                <StarRating value={r.stars} size={14} />
              </div>
              {r.feedback && <p className="text-sm text-muted mt-2 leading-relaxed">{r.feedback}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title={reportDone ? "" : "Report user"} testid="report-user-modal">
        {reportDone ? (
          <div className="text-center py-4" data-testid="report-user-success">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 320, damping: 18 }} className="w-14 h-14 rounded-2xl bg-status-borrowed text-white flex items-center justify-center mx-auto mb-3"><CheckCircle size={30} weight="fill" /></motion.div>
            <p className="text-ink font-head font-semibold text-lg">Report submitted</p>
            <p className="text-sm text-muted mt-1">Moderators will review this member shortly.</p>
            <Button className="w-full mt-5" onClick={() => setReportOpen(false)} data-testid="report-user-close">Done</Button>
          </div>
        ) : (
          <>
            {modalErr && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl px-3.5 py-2.5 mb-3">{modalErr}</div>}
            <p className="text-sm text-muted mb-3">Report <b className="text-ink">{u.full_name}</b> for a serious trust violation. Misuse may affect your own standing.</p>
            <Select label="Reason" value={report.report_category} onChange={(e) => setReport({ ...report, report_category: e.target.value })} data-testid="report-user-category">
              <option value="">Select a reason</option>
              {REPORT_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <div className="mt-3">
              <Textarea label="Details (optional)" rows={3} placeholder="Describe what happened" value={report.description} onChange={(e) => setReport({ ...report, description: e.target.value })} data-testid="report-user-description" />
            </div>
            <Button className="w-full mt-5" loading={submitting} onClick={submitReport} disabled={submitting || !report.report_category} data-testid="report-user-submit">Submit report</Button>
          </>
        )}
      </Modal>
    </div>
  );
}
