import React, { useState } from 'react';

function JoinZoomRedirect() {
  const [meetingID, setMeetingID] = useState('');
  const [password, setPassword] = useState('');

  const handleJoin = () => {
    if (!meetingID || !password) {
      alert('Please enter Meeting ID and Password');
      return;
    }

    const encodedPwd = encodeURIComponent(password);
    const zoomUrl = `https://zoom.us/j/${meetingID}?pwd=${encodedPwd}`;

    window.location.href = zoomUrl; // redirect to Zoom
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Join Zoom Meeting</h2>
      <input
        placeholder="Meeting ID"
        value={meetingID}
        onChange={(e) => setMeetingID(e.target.value)}
      />
      <br />
      <input
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleJoin}>Join via Zoom</button>
    </div>
  );
}

export default JoinZoomRedirect;
