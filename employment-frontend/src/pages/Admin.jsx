import { Link } from 'react-router-dom';
import { useResource } from '../hooks/useResource';
import client from '../api/client';
import { Action, Badge, Empty, Form, Resource, Title } from '../components/common/UI';

export function AdminDashboard() {
  const resource = useResource('/admin/dashboard');
  const labels = {
    companies: '승인 대기 기업',
    jobs: '심사 대기 공고',
    inquiries: '미답변 문의',
    employmentLinks: '진행 중 취업연계',
  };
  return (
    <>
      <Title description="처리가 필요한 운영 현황을 확인하세요.">관리자 대시보드</Title>
      <Resource resource={resource}>
        {(data) => (
          <div className="stats">
            {Object.entries(labels).map(([k, v]) => (
              <div key={k}>
                <span>{v}</span>
                <strong>{data[k]}</strong>
              </div>
            ))}
          </div>
        )}
      </Resource>
    </>
  );
}

const titles = {
  users: '회원 관리',
  companies: '기업 심사',
  jobs: '공고 심사',
  'employment-links': '취업연계 관리',
  notices: '공지 관리',
  inquiries: '문의 관리',
};
export function AdminManage({ resourceName }) {
  const resource = useResource(`/admin/${resourceName}`);
  return (
    <>
      <Title>{titles[resourceName]}</Title>
      {resourceName === 'notices' && (
        <div className="panel narrow">
          <h2>공지 작성</h2>
          <NoticeForm onDone={resource.reload} />
        </div>
      )}
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="stack">
              {rows.map((r, i) => (
                <article className="panel" key={i}>
                  <AdminRow name={resourceName} row={r} reload={resource.reload} />
                </article>
              ))}
            </div>
          ) : (
            <Empty>처리할 내역이 없습니다.</Empty>
          )
        }
      </Resource>
    </>
  );
}

function AdminRow({ name, row: r, reload }) {
  if (name === 'users')
    return (
      <>
        <div className="row">
          <div>
            <h2>{r.name}</h2>
            <p>
              {r.email} · {r.role}
            </p>
          </div>
          <Badge value={r.status} />
        </div>
        {r.role !== 'ADMIN' && (
          <Action
            method="patch"
            url={`/admin/users/${r.userId}/status`}
            body={{ status: r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }}
            onDone={reload}
            confirm="회원 상태를 변경할까요?"
          >
            {r.status === 'ACTIVE' ? '회원 정지' : '정지 해제'}
          </Action>
        )}
      </>
    );
  if (name === 'companies' || name === 'jobs') {
    const company = name === 'companies';
    const status = company ? r.approvalStatus : r.status;
    const url = company
      ? `/admin/companies/${r.companyId}/approval`
      : `/admin/jobs/${r.jobId}/status`;
    return (
      <>
        <div className="row">
          <h2>{company ? r.companyName : r.title}</h2>
          <Badge value={status} />
        </div>
        <p className="prose">{r.description || '소개 미입력'}</p>
        {company ? (
          <p>
            사업자번호: {r.businessNumber} · 업종: {r.industry}
          </p>
        ) : (
          <p>
            {r.workLocation} · {r.startDate} ~ {r.endDate}
          </p>
        )}
        {status === 'PENDING' && (
          <Form
            fields={[
              {
                name: 'status',
                label: '심사 결과',
                required: true,
                options: company ? ['APPROVED', 'REJECTED'] : ['PUBLISHED', 'REJECTED'],
              },
              { name: 'reason', label: '심사 사유 (반려 시 필수)', type: 'textarea' },
            ]}
            onSubmit={async (body) => {
              await client.patch(url, body);
              await reload();
            }}
            submit="심사 결과 저장"
          />
        )}
        {!company && status === 'PUBLISHED' && (
          <Action method="patch" url={url} body={{ status: 'CLOSED' }} onDone={reload}>
            공고 마감
          </Action>
        )}
      </>
    );
  }
  if (name === 'inquiries')
    return (
      <>
        <div className="row">
          <h2>{r.title}</h2>
          <Badge value={r.status} />
        </div>
        <p className="prose">{r.content}</p>
        <Form
          initial={r}
          fields={[{ name: 'answer', label: '운영자 답변', type: 'textarea', required: true }]}
          onSubmit={async (body) => {
            await client.put(`/admin/inquiries/${r.inquiryId}/answer`, body);
            await reload();
          }}
          submit="답변 등록"
        />
      </>
    );
  if (name === 'notices')
    return (
      <>
        <h2>{r.title}</h2>
        <Badge value={r.isPublished ? '게시 중' : '미게시'} />
        <NoticeForm initial={r} onDone={reload} />
      </>
    );
  return (
    <>
      <div className="row">
        <h2>취업연계 #{r.employmentLinkId}</h2>
        <Badge value={r.status} />
      </div>
      <p>
        구직자 #{r.jobSeekerId} · 신청 {r.requestedAt?.slice(0, 10)}
      </p>
      {!['EMPLOYED', 'CLOSED'].includes(r.status) && (
        <Form
          initial={r}
          fields={[
            {
              name: 'status',
              label: '진행 상태',
              required: true,
              options: ['REQUESTED', 'COUNSELING', 'MATCHING', 'INTERVIEW', 'EMPLOYED', 'CLOSED'],
            },
            { name: 'managerUserId', label: '담당 관리자 ID', type: 'number', min: 1 },
            { name: 'companyId', label: '연계 기업 ID', type: 'number', min: 1 },
            { name: 'jobId', label: '연계 공고 ID', type: 'number', min: 1 },
            { name: 'publicMessage', label: '구직자 공개 안내', type: 'textarea' },
            { name: 'memo', label: '관리자 내부 메모 (비공개)', type: 'textarea' },
          ]}
          onSubmit={async (body) => {
            await client.patch(`/admin/employment-links/${r.employmentLinkId}`, body);
            await reload();
          }}
        />
      )}
    </>
  );
}

function NoticeForm({ initial, onDone }) {
  return (
    <Form
      initial={initial || {}}
      fields={[
        { name: 'title', label: '공지 제목', required: true, maxLength: 200 },
        { name: 'content', label: '공지 본문', type: 'textarea', required: true },
        { name: 'isPublished', label: '공개 게시', type: 'checkbox' },
      ]}
      onSubmit={async (body) => {
        if (initial) await client.put(`/admin/notices/${initial.noticeId}`, body);
        else await client.post('/admin/notices', body);
        await onDone();
      }}
    />
  );
}
