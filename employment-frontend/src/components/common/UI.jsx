import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import client, { message } from '../../api/client';

export const labels = {
  ACTIVE: '활성',
  SUSPENDED: '정지',
  JOB_SEEKER: '구직자',
  COMPANY: '기업',
  ADMIN: '관리자',
  PENDING: '심사 중',
  APPROVED: '승인',
  REJECTED: '반려·불합격',
  DRAFT: '초안',
  PUBLISHED: '채용 중',
  CLOSED: '마감·종료',
  APPLIED: '지원 완료',
  UNDER_REVIEW: '서류 검토',
  DOCUMENT_PASSED: '서류 합격',
  INTERVIEW: '면접',
  FINAL_PASSED: '최종 합격',
  CANCELED: '취소',
  REQUESTED: '신청 접수',
  COUNSELING: '상담 중',
  MATCHING: '매칭 중',
  EMPLOYED: '취업 완료',
  OPEN: '답변 대기',
  ANSWERED: '답변 완료',
  SCHEDULED: '예정',
  COMPLETED: '완료',
  ONLINE: '온라인',
  OFFLINE: '오프라인',
};

export function Badge({ value }) {
  return <span className={`badge badge-${value}`}>{labels[value] || value}</span>;
}
export function Title({ eyebrow, children, description, action }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{children}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Resource({ resource, children }) {
  if (resource.loading)
    return (
      <div className="empty" role="status">
        정보를 불러오는 중입니다…
      </div>
    );
  if (resource.error)
    return (
      <div className="empty error" role="alert">
        <p>{resource.error}</p>
        <button onClick={resource.reload}>다시 시도</button>
      </div>
    );
  return children(resource.data);
}
export function Empty({ children = '아직 등록된 내역이 없습니다.', to, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">＋</span>
      <h3>{children}</h3>
      <p>새로운 기회를 위한 첫걸음을 시작해 보세요.</p>
      {to && (
        <Link className="button" to={to}>
          {action}
        </Link>
      )}
    </div>
  );
}
export function Guard({ role, children }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Empty>접근 권한이 없는 화면입니다.</Empty>;
  return children;
}
export function Action({
  url,
  method = 'post',
  body = {},
  children,
  onDone,
  confirm,
  className = 'secondary',
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run() {
    if (confirm && !window.confirm(confirm)) return;
    setBusy(true);
    setError('');
    try {
      await client.request({ url, method, data: body });
      await onDone?.();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <span className="action">
      <button className={className} disabled={busy} onClick={run}>
        {busy ? '처리 중…' : children}
      </button>
      {error && (
        <span className="error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}

export function Form({ fields, initial = {}, onSubmit, submit = '저장하기', children }) {
  const [values, setValues] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(values);
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form" onSubmit={save}>
      {fields.map(
        ({ name, label, type = 'text', options, required = false, maxLength = 10000, ...rest }) => (
          <label key={name} className={type === 'checkbox' ? 'checkbox' : ''}>
            <span>
              {label}
              {required && <small> *</small>}
            </span>
            {type === 'textarea' ? (
              <textarea
                name={name}
                value={values[name] || ''}
                onChange={(e) => setValues({ ...values, [name]: e.target.value })}
                required={required}
                maxLength={maxLength}
                {...rest}
              />
            ) : options ? (
              <select
                name={name}
                value={values[name] || ''}
                onChange={(e) => setValues({ ...values, [name]: e.target.value })}
                required={required}
              >
                <option value="">선택해 주세요</option>
                {options.map((o) => (
                  <option key={o.value ?? o} value={o.value ?? o}>
                    {o.label ?? labels[o] ?? o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={name}
                type={type}
                value={type === 'checkbox' ? undefined : (values[name] ?? '')}
                checked={type === 'checkbox' ? Boolean(values[name]) : undefined}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [name]: type === 'checkbox' ? e.target.checked : e.target.value,
                  })
                }
                required={required}
                maxLength={maxLength}
                {...rest}
              />
            )}
          </label>
        ),
      )}
      {children}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="form-actions">
        <button type="submit" disabled={busy}>
          {busy ? '처리 중…' : submit}
        </button>
      </div>
    </form>
  );
}

export function JobCard({ job }) {
  const days = Math.ceil((Date.parse(job.endDate + 'T23:59:59+09:00') - Date.now()) / 86400000);
  return (
    <article className="job-card">
      <div className="card-top">
        <span className="company-symbol">{job.companyName?.slice(0, 1)}</span>
        <span className="deadline">
          {days < 0 ? '마감' : days === 0 ? '오늘 마감' : `D-${days}`}
        </span>
      </div>
      <p className="company-name">{job.companyName}</p>
      <h3>
        <Link to={`/jobs/${job.jobId}`}>{job.title}</Link>
      </h3>
      <p className="muted">
        {job.workLocation} <span>·</span> {job.careerType}
      </p>
      <div className="tags">
        <span>{job.jobType}</span>
        <span>{job.education || '학력 무관'}</span>
      </div>
      <div className="card-bottom">
        <span>{job.endDate} 마감</span>
        <Link to={`/jobs/${job.jobId}`} aria-label={`${job.title} 자세히 보기`}>
          자세히 보기 ↗
        </Link>
      </div>
    </article>
  );
}
