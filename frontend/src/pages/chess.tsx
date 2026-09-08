import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Swords, Flag, Clock, ArrowRight, Shield, RotateCcw } from 'lucide-react';
import { api, refresh } from '../api';
import { useData } from '../hooks';
export function ChessArena({ session, team }: any) {
  const { data: matches } = useData('/chess/matches');
  const [selectedId, setSelectedId] = useState<string | null>(null),
    [waiting, setWaiting] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [source, setSource] = useState(''),
    [promotion, setPromotion] = useState<any>(null),
    [resigning, setResigning] = useState(false);
  const active = matches?.find((m: any) => m.status === 'ACTIVE');
  const id = selectedId ?? active?.id ?? matches?.[0]?.id;
  const { data: match, reload } = useData(id ? '/chess/matches/' + id : null);
  useEffect(() => {
    if (active) {
      setWaiting(false);
      setSelectedId(active.id);
    }
  }, [active?.id]);
  useEffect(() => {
    api('/chess/matchmaking')
      .then((r) => setWaiting(r.waiting))
      .catch(() => {});
  }, []);
  const canPlay =
    session.role === 'CHESS' &&
    team.settings.state === 'RUNNING' &&
    match?.status === 'ACTIVE' &&
    match.fen.split(' ')[1] === match.color;
  async function act(fn: () => Promise<any>) {
    setBusy(true);
    setMessage('');
    try {
      return await fn();
    } catch (e: any) {
      setMessage(e.message);
      reload();
    } finally {
      setBusy(false);
    }
  }
  async function join() {
    const r = await act(() => api('/chess/matchmaking/join', {}));
    if (r) {
      setWaiting(r.status === 'WAITING');
      if (r.matchId) setSelectedId(r.matchId);
    }
  }
  function requestMove(from: string, to: string, piece = 'q') {
    if (!canPlay || busy) return;
    const p = new Chess(match.fen).get(from as any);
    if (p?.type === 'p' && (to[1] === '1' || to[1] === '8') && !promotion) {
      setPromotion({ from, to });
      return;
    }
    setPromotion(null);
    setSource('');
    act(() =>
      api('/chess/matches/' + id + '/move', { from, to, promotion: piece, expectedPly: match.ply }),
    );
  }
  const scores = match?.scores.filter((s: any) => s.team_id === session.team_id) ?? [];
  const score = (type: string) =>
    scores.filter((s: any) => s.type === type).reduce((sum: number, s: any) => sum + s.points, 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">01 / THE BOARD</p>
          <h2>Chess Arena</h2>
          <p className="muted">Different moves. Same mindset.</p>
        </div>
        <span className="badge">
          <Clock size={13} /> UNLIMITED TIME
        </span>
      </div>
      {message && (
        <div className="error" role="alert">
          {message}
        </div>
      )}
      {!match || waiting ? (
        <section className="panel matchmaking">
          <Swords size={48} />
          <h3>{waiting ? 'Waiting for your opponent…' : 'Your next opponent awaits.'}</h3>
          <p>
            Join the queue to play another team.
            <br />
            Capture pieces. Find strong moves. Build your team’s score.
          </p>
          {waiting ? (
            <button
              className="secondary"
              onClick={() =>
                act(() => api('/chess/matchmaking/cancel', {})).then(() => setWaiting(false))
              }
            >
              Leave queue
            </button>
          ) : (
            <button
              disabled={busy || session.role !== 'CHESS' || team.settings.state !== 'RUNNING'}
              onClick={join}
            >
              Find opponent <ArrowRight size={18} />
            </button>
          )}
        </section>
      ) : (
        <div className="chess-layout">
          <section className="board-panel">
            <div className="player-strip">
              <Swords size={21} />
              <b>{match.color === 'w' ? match.black_team : match.white_team}</b>
              <span>OPPONENT · {match.color === 'w' ? 'BLACK' : 'WHITE'}</span>
            </div>
            <div className="board-wrap">
              <Chessboard
                options={{
                  id: 'codemate-board',
                  position: match.fen,
                  boardOrientation: match.color === 'w' ? 'white' : 'black',
                  allowDragging: canPlay && !busy,
                  darkSquareStyle: { backgroundColor: '#7c5c3c' },
                  lightSquareStyle: { backgroundColor: '#e6ceb0' },
                  boardStyle: { borderRadius: '5px' },
                  onPieceDrop: ({ sourceSquare, targetSquare }) => {
                    if (targetSquare) requestMove(sourceSquare, targetSquare);
                    return false;
                  },
                  onSquareClick: ({ square }) => {
                    if (!canPlay) return;
                    if (source && source !== square) requestMove(source, square);
                    else setSource(square);
                  },
                  squareStyles: source ? { [source]: { backgroundColor: '#d3a452' } } : {},
                }}
              />
            </div>
            <div className="player-strip">
              <Shield size={21} />
              <b>{session.team_id}</b>
              <span>YOU · {match.color === 'w' ? 'WHITE' : 'BLACK'}</span>
            </div>
            {match.status === 'ACTIVE' && (
              <form
                className="move-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  requestMove(String(f.get('from')), String(f.get('to')));
                }}
              >
                <label>
                  From
                  <input
                    name="from"
                    aria-label="Move from"
                    placeholder="e2"
                    pattern="[a-h][1-8]"
                    maxLength={2}
                    required
                  />
                </label>
                <label>
                  To
                  <input
                    name="to"
                    aria-label="Move to"
                    placeholder="e4"
                    pattern="[a-h][1-8]"
                    maxLength={2}
                    required
                  />
                </label>
                <button disabled={!canPlay || busy}>Move</button>
              </form>
            )}
          </section>
          <aside>
            <section className="panel">
              <span className="eyebrow">MATCH STATUS</span>
              <h3 className="turn-label">
                {match.status === 'COMPLETED'
                  ? 'Game complete · ' + match.result
                  : canPlay
                    ? 'Your move.'
                    : 'Opponent’s move.'}
              </h3>
              {match.status === 'COMPLETED' && (
                <p className="muted">
                  {match.termination.replaceAll('_', ' ')}
                  {match.score_void ? ' · Early resignation: game points reversed.' : ''}
                </p>
              )}
              <div className="chess-score">
                <strong>{scores.reduce((n: number, s: any) => n + s.points, 0)}</strong>
                <span>THIS MATCH · YOUR POINTS</span>
              </div>
              {[
                ['Capture points', score('CHESS_CAPTURE')],
                ['Move quality', score('CHESS_MOVE_QUALITY')],
                ['Checkmate bonus', score('CHESS_CHECKMATE')],
                ['Result bonus', score('CHESS_RESULT')],
              ].map(([label, value]) => (
                <div className="list-row" key={label}>
                  <span>{label}</span>
                  <b>{value}</b>
                </div>
              ))}
              {match.moves.some((m: any) =>
                ['PENDING_ANALYSIS', 'PROCESSING'].includes(m.analysis_status),
              ) && (
                <p className="small muted">
                  Analysis pending. Your move-quality scoring will sync when the engine finishes.
                </p>
              )}
              {match.status === 'ACTIVE' &&
                session.role === 'CHESS' &&
                (resigning ? (
                  <div className="confirm-inline">
                    <p>Resign this match? Early resignation may reverse all game points.</p>
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() =>
                        act(() => api('/chess/matches/' + id + '/resign', {})).then(() =>
                          setResigning(false),
                        )
                      }
                    >
                      Confirm resignation
                    </button>
                    <button className="secondary" onClick={() => setResigning(false)}>
                      Keep playing
                    </button>
                  </div>
                ) : (
                  <button
                    className="secondary wide"
                    onClick={() => setResigning(true)}
                    disabled={busy || team.settings.state !== 'RUNNING'}
                  >
                    <Flag size={16} /> Resign match
                  </button>
                ))}
              {match.status === 'COMPLETED' && session.role === 'CHESS' && (
                <button
                  className="wide"
                  onClick={join}
                  disabled={busy || team.settings.state !== 'RUNNING'}
                >
                  Find next opponent <RotateCcw size={16} />
                </button>
              )}
            </section>
            <section className="panel move-history">
              <h3>Move history</h3>
              <div className="moves">
                {match.moves.map((m: any) => (
                  <div className="move-row" key={m.id}>
                    <span>{m.ply}.</span>
                    <b>{m.san}</b>
                    <small className={m.points < 0 ? 'negative' : 'positive'}>
                      {m.classification ?? 'Pending'}{' '}
                      {m.analysis_status === 'COMPLETE' ? (m.points > 0 ? '+' : '') + m.points : ''}
                    </small>
                  </div>
                ))}
              </div>
              {!match.moves.length && <p className="empty">The board is set. White moves first.</p>}
            </section>
          </aside>
        </div>
      )}
      {matches?.length > 0 && (
        <section className="panel history-panel">
          <h3>Your matches</h3>
          {matches.map((m: any) => (
            <button
              className="match-history-button"
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                setWaiting(false);
              }}
            >
              <span>
                {m.white_team} vs {m.black_team}
              </span>
              <span>
                {m.status === 'ACTIVE' ? 'In progress' : m.result} · {m.ply} plies
              </span>
            </button>
          ))}
        </section>
      )}
      {promotion && (
        <div className="modal-backdrop">
          <section
            className="panel modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose promotion"
          >
            <h3>Promote your pawn</h3>
            <div className="role-select">
              {[
                ['q', 'Queen'],
                ['r', 'Rook'],
                ['b', 'Bishop'],
                ['n', 'Knight'],
              ].map(([p, label]) => (
                <button key={p} onClick={() => requestMove(promotion.from, promotion.to, p)}>
                  {label}
                </button>
              ))}
            </div>
            <button className="secondary" onClick={() => setPromotion(null)}>
              Cancel
            </button>
          </section>
        </div>
      )}
    </>
  );
}
