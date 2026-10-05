import React, { useEffect, useState } from "react";
import { db } from '../../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import '../static-signs.css';

export default function LeaderBoard() {
  const { t } = useTranslation("common");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // 1. Fetch all staticSigns score entries
        const scoresSnap = await getDocs(
          query(collection(db, 'userScores'), where('category', '==', 'staticSigns'))
        );

        if (scoresSnap.empty) {
          setLeaderboardData([]);
          setLoading(false);
          return;
        }

        // 2. Fetch all users for name lookup
        const usersSnap = await getDocs(collection(db, 'users'));
        const nameMap = {};
        usersSnap.docs.forEach(doc => {
          const d = doc.data();
          nameMap[doc.id] = d.name || d.displayName || d.email || t('unknown');
        });

        // 3. Build rows — one per score entry
        const rows = scoresSnap.docs.map(doc => {
          const d = doc.data();
          const ts = d.timestamp?.toDate ? d.timestamp.toDate() : null;
          return {
            id: doc.id,
            name: nameMap[d.userId] || t('unknown'),
            score: d.score || 0,
            accuracy: d.accuracy || 0,
            sign: d.lessonType ? d.lessonType.replace('Static Signs - ', '') : '—',
            date: ts ? ts.toLocaleDateString() : '—',
            time: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
          };
        });

        // 4. Sort by score descending
        rows.sort((a, b) => b.score - a.score);
        setLeaderboardData(rows);
      } catch (e) {
        console.error('Leaderboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const rankClass = (i) => {
    if (i === 0) return 'ss-rank-badge ss-rank-1';
    if (i === 1) return 'ss-rank-badge ss-rank-2';
    if (i === 2) return 'ss-rank-badge ss-rank-3';
    return 'ss-rank-badge ss-rank-other';
  };

  return (
    <div className="ss-page">
      <div className="ss-container">

        <div className="ss-lb-header">
          <div className="ss-lb-title">🏆 {t('leaderboardTitle')}</div>
          <div className="ss-lb-subtitle">{t('ssTopPlayersRanked')}</div>
        </div>

        <div className="ss-table-wrapper">
          <table className="ss-table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>{t('ssRankLabel')}</th>
                <th>{t('name')}</th>
                <th style={{ width: '90px' }}>{t('ssSignLabel', 'Sign')}</th>
                <th style={{ width: '110px' }}>{t('score')}</th>
                <th style={{ width: '110px' }}>{t('ssAccuracy', 'Accuracy')}</th>
                <th style={{ width: '160px' }}>{t('ssDateTime', 'Date & Time')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="ss-table-empty">
                    {t('loading', 'Loading...')}
                  </td>
                </tr>
              )}
              {!loading && leaderboardData.length === 0 && (
                <tr>
                  <td colSpan={6} className="ss-table-empty">
                    {t('ssNoScoresYet')}
                  </td>
                </tr>
              )}
              {leaderboardData.map((row, index) => (
                <tr key={row.id}>
                  <td><span className={rankClass(index)}>{index + 1}</span></td>
                  <td>
                    <span style={{ fontWeight: index < 3 ? 700 : 500, color: '#2d3748' }}>
                      {row.name}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                      {row.sign}
                    </span>
                  </td>
                  <td><span className="ss-score-value">{row.score}%</span></td>
                  <td><span className="ss-score-value">{row.accuracy}%</span></td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#4a5568', lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 600 }}>{row.date}</div>
                      <div style={{ color: '#a0aec0' }}>{row.time}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
