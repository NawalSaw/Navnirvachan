"use client";

import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

const CameraCapture = ({
  onCapture,
}: {
  onCapture: (image: string) => void;
}) => {
  const videoRef: any = useRef(null);
  const canvasRef: any = useRef(null);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        toast.error(err.message);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    // Draw the video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to an image URL
    const imageDataURL = canvas.toDataURL("image/png");
    setImage(imageDataURL);

    onCapture(imageDataURL);
  };
  
  if (loading) {
    return (
      <div className="w-[40vw] h-[50vh] flex items-center justify-center bg-gray-700 rounded-lg font-bold">
        <p>loading...</p>
      </div>
    );
  }
  
  return (
    <div style={{ textAlign: "center" }} className="">
      {error ? (
        <div className="w-[40vw] h-[50vh] flex items-center justify-center bg-gray-700 rounded-lg font-bold">
          <p>{error}</p>
        </div>
      ) : (
        <span className="w-[40vw] h-[50vh]">
          {!image && !loading && (
            <>
              {" "}
              <video ref={videoRef} className="w-[40vw] h-[50vh]" autoPlay />
              <br />
              <button onClick={captureImage}>Capture</button>
              <br />
              <canvas
                ref={canvasRef}
                className="w-[40vw] h-[50vh]"
                style={{ display: "none" }}
                />
            </>
          )}
          {image && (
            <div>
              <h3>Captured Image:</h3>
                <img src={image} alt="Captured" className="w-[40vw] h-[50vh] rounded-xl" />
                <br />
                <a href={image} download="captured.png">Download</a>
                {/* downloadRef?.current?.click(); */}
            </div>
          )}
        </span>
      )}
    </div>
  );
};

export default CameraCapture;
