import React from "react";

const ZoomIframe = ({ meetingId, passcode }) => {
  const zoomSrc = `https://zoom.us/wc/${meetingId}/join?pwd=${passcode}`;

  return (
    <div className="zoom-container">
      <iframe
        src={zoomSrc}
        title="Zoom Meeting"
        width="100%"
        height="700"
        allow="camera; microphone; fullscreen; display-capture"
        frameBorder="0"
        style={{ borderRadius: "12px" }}
      />
    </div>
  );
};

export default ZoomIframe;
