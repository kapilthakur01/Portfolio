import React from 'react';
import { registerCommand } from '../commandRegistry.jsx';
import { getCachedLeetCodeCount } from '../../services/leetcodeService.js';

// ── sudo hire-me ──────────────────────────────────────────────
registerCommand('sudo', {
  description: 'You know what this does.',
  usage: 'sudo hire-me',
  handler: async ({ args }) => {
    const sub = args.join(' ').toLowerCase();

    if (sub === 'hire-me') {
      return (
        <div style={{ whiteSpace: 'pre', color: 'var(--text-primary)' }}>
{`
[sudo] password for visitor: ••••••••
Authenticating...
Access granted. ✓

  ██╗  ██╗██╗██████╗ ███████╗    ███╗   ███╗███████╗
  ██║  ██║██║██╔══██╗██╔════╝    ████╗ ████║██╔════╝
  ███████║██║██████╔╝█████╗      ██╔████╔██║█████╗
  ██╔══██║██║██╔══██╗██╔══╝      ██║╚██╔╝██║██╔══╝
  ██║  ██║██║██║  ██║███████╗    ██║ ╚═╝ ██║███████╗
  ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝     ╚═╝╚══════╝

Executing: hire Kapil Thakur...
`}
          <span style={{ color: 'var(--text-white)' }}>
            Smart call. He builds real things: ride-sharing platforms, blockchain exam platforms,{'\n'}
            mentoring tools. CGPA 9.0+. {getCachedLeetCodeCount()} LeetCode problems. MERN + Android + DSA.
          </span>
          {'\n\n'}
          <span style={{ color: 'var(--text-dim)' }}>Reach him at: </span>
          <a href="mailto:thakurkapil2007@gmail.com" style={{ color: 'var(--text-link)' }}>
            thakurkapil2007@gmail.com
          </a>
        </div>
      );
    }

    return (
      <span style={{ color: 'var(--text-error)' }}>
        sudo: permission denied.{'\n'}
        <span style={{ color: 'var(--text-muted)' }}>
          (Try <span style={{ color: 'var(--text-primary)' }}>sudo hire-me</span>)
        </span>
      </span>
    );
  },
});

