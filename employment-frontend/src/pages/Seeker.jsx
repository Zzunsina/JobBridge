import { Link, useNavigate, useParams } from 'react-router-dom';
import { useResource } from '../hooks/useResource';
import { useAuth } from '../stores/auth';
import client from '../api/client';
import { Action, Badge, Empty, Form, JobCard, Resource, Title } from '../components/common/UI';

export function Resumes() {
  const resource = useResource('/resumes');
  return (
    <>
      <Title
        description="나의 경험과 강점이 다음 기회로 이어집니다."
        action={
          <Link className="button" to="/resumes/new">
            ＋ 새 이력서
          </Link>
        }
      >
        이력서 관리
      </Title>
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="stack">
              {rows.map((r) => (
                <article className="panel" key={r.resumeId}>
                  <div className="row">
                    <h2>{r.title}</h2>
                    <div className="tags">
                      {r.isDefault && <Badge value="기본 이력서" />}
                      <Badge value={r.isPublic ? '공개' : '비공개'} />
                    </div>
                  </div>
                  <p className="muted">최종 수정 {r.updatedAt?.slice(0, 10)}</p>
                  <p>{r.skills || '등록한 기술이 없습니다.'}</p>
                  <div className="actions">
                    <Link className="button secondary" to={`/resumes/${r.resumeId}/edit`}>
                      수정하기
                    </Link>
                    {!r.isDefault && (
                      <Action
                        url={`/resumes/${r.resumeId}/default`}
                        method="put"
                        onDone={resource.reload}
                      >
                        기본 지정
                      </Action>
                    )}
                    <Action
                      method="delete"
                      url={`/resumes/${r.resumeId}`}
                      onDone={resource.reload}
                      confirm="이 이력서를 삭제할까요?"
                    >
                      삭제
                    </Action>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty to="/resumes/new" action="첫 이력서 작성">
              나만의 이력서를 만들어 보세요.
            </Empty>
          )
        }
      </Resource>
    </>
  );
}

const resumeFields = [
  { name: 'title', label: '이력서 제목', required: true, maxLength: 200 },
  { name: 'education', label: '학력', maxLength: 100 },
  { name: 'careerDescription', label: '경력 및 프로젝트 경험', type: 'textarea' },
  { name: 'skills', label: '보유 기술', type: 'textarea' },
  { name: 'portfolioUrl', label: '포트폴리오 주소', type: 'url', maxLength: 500 },
  { name: 'isDefault', label: '기본 이력서로 지정', type: 'checkbox' },
  {
    name: 'isPublic',
    label: '공개 여부 저장 (현재 기업의 전체 이력서 검색은 제공하지 않습니다)',
    type: 'checkbox',
  },
];
export function ResumeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = useResource(id ? `/resumes/${id}` : '/resumes');
  return (
    <>
      <Title description="지원 시점의 내용이 별도로 보존되므로 이후 수정해도 기존 제출 내용은 유지됩니다.">
        {id ? '이력서 수정' : '새 이력서 작성'}
      </Title>
      <Resource resource={resource}>
        {(data) => (
          <div className="panel narrow">
            <Form
              initial={id ? data : { isPublic: false }}
              fields={resumeFields}
              onSubmit={async (body) => {
                if (id) await client.put(`/resumes/${id}`, body);
                else await client.post('/resumes', body);
                navigate('/resumes');
              }}
            />
          </div>
        )}
      </Resource>
    </>
  );
}

export function Applications() {
  const resource = useResource('/applications');
  return (
    <>
      <Title description="제출한 지원서와 채용 진행 상황을 확인하세요.">지원 내역</Title>
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="stack">
              {rows.map((r) => (
                <Link
                  className="panel row"
                  key={r.applicationId}
                  to={`/applications/${r.applicationId}`}
                >
                  <div>
                    <p className="muted">{r.companyName}</p>
                    <h2>{r.title}</h2>
                    <p>지원일 {r.appliedAt?.slice(0, 10)}</p>
                  </div>
                  <Badge value={r.status} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty to="/jobs" action="채용공고 둘러보기">
              아직 지원한 공고가 없습니다.
            </Empty>
          )
        }
      </Resource>
    </>
  );
}

export function ApplicationDetail() {
  const { id } = useParams();
  const resource = useResource(`/applications/${id}`);
  return (
    <Resource resource={resource}>
      {(a) => (
        <>
          <Title description={a.companyName}>{a.title}</Title>
          <div className="panel">
            <Badge value={a.status} />
            <h2>지원 당시 제출 내용</h2>
            <Snapshot data={a.snapshot} />
            <h3>자기소개서</h3>
            <p className="prose">{a.coverLetter || '작성한 자기소개서가 없습니다.'}</p>
            <h2>면접 일정</h2>
            <Interviews rows={a.interviews} />
            {['APPLIED', 'UNDER_REVIEW', 'DOCUMENT_PASSED', 'INTERVIEW'].includes(a.status) && (
              <Action
                url={`/applications/${id}/cancel`}
                onDone={resource.reload}
                confirm="지원을 취소할까요? 취소 후 재지원할 수 없습니다."
              >
                지원 취소
              </Action>
            )}
          </div>
        </>
      )}
    </Resource>
  );
}

export function Snapshot({ data }) {
  if (!data)
    return (
      <p className="callout">
        이전 시스템에서 등록한 지원입니다. 지원 당시 제출 스냅샷은 보관되어 있지 않습니다.
      </p>
    );
  return (
    <div className="snapshot">
      <h3>{data.resume.title}</h3>
      <p>
        {data.contact.name} · {data.contact.email} · {data.contact.phone}
      </p>
      {[
        ['학력', data.resume.education],
        ['경력', data.resume.careerDescription],
        ['기술', data.resume.skills],
      ].map(([k, v]) => (
        <section key={k}>
          <h4>{k}</h4>
          <p className="prose">{v || '미입력'}</p>
        </section>
      ))}
      {data.resume.portfolioUrl && (
        <a href={data.resume.portfolioUrl} target="_blank" rel="noreferrer">
          포트폴리오 ↗
        </a>
      )}
    </div>
  );
}

export function Interviews({ rows }) {
  return rows.length ? (
    rows.map((i) => (
      <div className="callout" key={i.interviewId}>
        <Badge value={i.status} />
        <p>
          {new Date(i.interviewAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (한국 시간)
        </p>
        <p>
          {i.interviewType === 'ONLINE' ? '온라인' : '오프라인'} · {i.location}
        </p>
        {i.meetingUrl && (
          <a href={i.meetingUrl} target="_blank" rel="noreferrer">
            면접 참여 링크 ↗
          </a>
        )}
        {i.result && <p>{i.result}</p>}
      </div>
    ))
  ) : (
    <p className="muted">등록된 면접 일정이 없습니다.</p>
  );
}

export function Bookmarks() {
  const resource = useResource('/bookmarks');
  return (
    <>
      <Title description="관심 있는 기회를 한곳에 모아보세요.">관심 공고</Title>
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="job-grid">
              {rows.map((r) => (
                <div key={r.bookmarkId}>
                  {r.job ? (
                    <JobCard job={r.job} />
                  ) : (
                    <div className="panel">비공개되었거나 조회할 수 없는 공고입니다.</div>
                  )}
                  <Action url={`/bookmarks/${r.jobId}`} method="delete" onDone={resource.reload}>
                    관심 해제
                  </Action>
                </div>
              ))}
            </div>
          ) : (
            <Empty to="/jobs" action="공고 탐색">
              관심 공고가 없습니다.
            </Empty>
          )
        }
      </Resource>
    </>
  );
}

export function Employment() {
  const resource = useResource('/employment-links');
  return (
    <>
      <Title
        eyebrow="YOUR CAREER PARTNER"
        description="상담부터 기업 매칭까지, 더 나은 내일을 함께 준비합니다."
      >
        취업연계 서비스
      </Title>
      <div className="process">
        {['01 신청 접수', '02 맞춤 상담', '03 기업 매칭', '04 면접 진행', '05 취업 확인'].map(
          (x) => (
            <div key={x}>{x}</div>
          ),
        )}
      </div>
      <div className="panel">
        <h2>당신의 다음 걸음을 돕습니다.</h2>
        <p>신청 후 담당자가 상담을 진행하고, 적합한 기업과 채용 기회를 연결합니다.</p>
        <Action url="/employment-links" onDone={resource.reload}>
          취업연계 신청하기 →
        </Action>
      </div>
      <h2 className="section">나의 진행 내역</h2>
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="stack">
              {rows.map((r) => (
                <div className="panel" key={r.employmentLinkId}>
                  <div className="row">
                    <h3>취업연계 #{r.employmentLinkId}</h3>
                    <Badge value={r.status} />
                  </div>
                  <p>신청일 {r.requestedAt?.slice(0, 10)}</p>
                  <p className="prose">{r.publicMessage || '담당자의 안내를 기다려 주세요.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty>진행 중인 취업연계가 없습니다.</Empty>
          )
        }
      </Resource>
    </>
  );
}

export function MyPage() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const navigate = useNavigate();
  return (
    <>
      <Title>내 정보</Title>
      <div className="panel narrow">
        <h2>기본 정보</h2>
        <p>{user.email}</p>
        <Form
          initial={user}
          fields={[
            { name: 'name', label: '이름', required: true, maxLength: 100 },
            { name: 'phone', label: '전화번호', type: 'tel', required: true },
          ]}
          onSubmit={async (body) => {
            const { data } = await client.patch('/me', body);
            setUser(data);
            window.alert('내 정보를 저장했습니다.');
          }}
        />
        <hr />
        <h2>비밀번호 변경</h2>
        <Form
          fields={[
            {
              name: 'currentPassword',
              label: '현재 비밀번호',
              type: 'password',
              required: true,
              maxLength: 64,
            },
            {
              name: 'password',
              label: '새 비밀번호',
              type: 'password',
              required: true,
              minLength: 8,
              maxLength: 64,
            },
          ]}
          onSubmit={async (body) => {
            await client.patch('/me/password', body);
            setUser(null);
            navigate('/login');
          }}
          submit="변경 후 다시 로그인"
        />
      </div>
    </>
  );
}

export function Notifications() {
  const resource = useResource('/notifications');
  return (
    <>
      <Title>내 알림</Title>
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="stack">
              {rows.map((r) => (
                <article className="panel row" key={r.notificationId}>
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.content}</p>
                    <small>{r.createdAt?.slice(0, 10)}</small>
                  </div>
                  {r.isRead ? (
                    <Badge value="읽음" />
                  ) : (
                    <Action
                      url={`/notifications/${r.notificationId}/read`}
                      method="patch"
                      onDone={resource.reload}
                    >
                      읽음 처리
                    </Action>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <Empty>새로운 알림이 없습니다.</Empty>
          )
        }
      </Resource>
    </>
  );
}

export function Inquiries() {
  const resource = useResource('/inquiries');
  return (
    <>
      <Title description="궁금한 점을 남겨주시면 운영자가 답변해 드립니다.">고객센터</Title>
      <div className="panel narrow">
        <h2>1:1 문의하기</h2>
        <Form
          fields={[
            { name: 'title', label: '문의 제목', required: true, maxLength: 200 },
            { name: 'content', label: '문의 내용', type: 'textarea', required: true },
          ]}
          onSubmit={async (body) => {
            await client.post('/inquiries', body);
            await resource.reload();
            window.alert('문의가 접수되었습니다.');
          }}
          submit="문의 접수"
        />
      </div>
      <h2 className="section">나의 문의</h2>
      <Resource resource={resource}>
        {(rows) =>
          rows.length ? (
            <div className="stack">
              {rows.map((r) => (
                <article className="panel" key={r.inquiryId}>
                  <div className="row">
                    <h3>{r.title}</h3>
                    <Badge value={r.status} />
                  </div>
                  <p className="prose">{r.content}</p>
                  {r.answer && (
                    <div className="callout">
                      <strong>운영자 답변</strong>
                      <p className="prose">{r.answer}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <Empty>작성한 문의가 없습니다.</Empty>
          )
        }
      </Resource>
    </>
  );
}
