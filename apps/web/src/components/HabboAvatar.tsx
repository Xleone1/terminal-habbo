import React, { useState, useEffect } from 'react';

const USERNAMES = [
  'noodlesoup', 'matthew', 'ticket', 'm0nster', 'callie',
  'h0ts0up', 'dione', 'sprit', 'alvin', 'sierr',
  'josh', 'chilled', 'kraken', 'nexus', 'prime',
  'vortex', 'cyber', 'phantom', 'binary', 'echo',
];

function randomPick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Props {
  size?: number;
}

export default function HabboAvatar({ size = 48 }: Props) {
  const [username, setUsername] = useState(() => randomPick(USERNAMES));

  useEffect(() => {
    const interval = setInterval(() => {
      setUsername(randomPick(USERNAMES));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${username}&direction=2&head_direction=2&action=&gesture=nrm&size=m`;

  return (
    <div
      title={`avatar: ${username}`}
      style={{
        width: size,
        height: size,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.03)',
        background: 'rgba(10,12,14,0.4)',
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt="avatar"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: 'brightness(0.9) contrast(1.1)',
          mixBlendMode: 'luminosity',
          opacity: 0.85,
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
