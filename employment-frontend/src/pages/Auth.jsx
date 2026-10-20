import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../stores/auth';
import { Form } from '../components/common/UI';

export function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  return (
    <div className="auth-shell">
      <p className="eyebrow">WELCOME BACK</p>
      <h1>다시 만나 반가워요.</h1>
      <p className="muted">새로운 기회로 이어지는 여정을 시작하세요.</p>
      <Form
        fields={[
          { name: 'email', label: '이메일', type: 'email', required: true, maxLength: 255 },
          { name: 'password', label: '비밀번호', type: 'password', required: true, maxLength: 64 },
        ]}
        onSubmit={async (body) => {
          const user = await login(body);
          navigate(user.role === 'ADMIN' ? '/admin' : user.role === 'COMPANY' ? '/company' : '/');
        }}
        submit="로그인"
      />
      <div className="auth-links">
        <Link to="/find-password">비밀번호 찾기</Link>
        <Link to="/signup">회원가입 →</Link>
      </div>
    </div>
  );
}

export function Signup() {
  const [kind, setKind] = useState('job-seeker');
  const navigate = useNavigate();
  const fields = [
    { name: 'name', label: '이름', required: true, maxLength: 100 },
    { name: 'email', label: '이메일', type: 'email', required: true, maxLength: 255 },
    { name: 'phone', label: '전화번호', type: 'tel', required: true },
    {
      name: 'password',
      label: '비밀번호 (공백 없이 8~64자, 72바이트 이하)',
      type: 'password',
      required: true,
      minLength: 8,
      maxLength: 64,
    },
  ];
  if (kind === 'company')
    fields.push(
      { name: 'companyName', label: '기업명', required: true, maxLength: 200 },
      { name: 'businessNumber', label: '사업자등록번호 (10자리)', required: true },
    );
  return (
    <div className="auth-shell">
      <p className="eyebrow">JOIN JOBBRIDGE</p>
      <h1>새로운 시작, 함께해요.</h1>
      <div className="tabs">
        <button
          className={kind === 'job-seeker' ? '' : 'secondary'}
          onClick={() => setKind('job-seeker')}
        >
          구직자 회원
        </button>
        <button
          className={kind === 'company' ? '' : 'secondary'}
          onClick={() => setKind('company')}
        >
          기업 회원
        </button>
      </div>
      {kind === 'company' && (
        <p className="callout">기업 회원은 관리자 승인 후 공고 심사를 요청할 수 있습니다.</p>
      )}
      <Form
        key={kind}
        fields={fields}
        onSubmit={async (body) => {
          await client.post(`/auth/signup/${kind}`, body);
          navigate('/login');
        }}
        submit="가입하기"
      />
      <p>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}

export function FindPassword() {
  return (
    <div className="auth-shell">
      <h1>비밀번호 재설정</h1>
      <p className="callout">
        메일 서비스가 아직 설정되지 않았습니다. 운영자에게 비밀번호 재설정을 문의해 주세요.
      </p>
      <Link to="/login">로그인으로 돌아가기</Link>
    </div>
  );
}
