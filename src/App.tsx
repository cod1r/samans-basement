import { useEffect, useRef, useState } from "react";
import "./App.css";

function Toolbox() {
  return (
    <div style={{ position: "fixed", width: "100%", height: "min-content" }}>
      <div
        onClick={() => {
          dispatchEvent(new CustomEvent("new div"));
        }}
        style={{
          height: 50,
          width: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid red",
          borderRadius: 5,
          userSelect: "none",
          cursor: "pointer",
        }}
      >
        +
      </div>
    </div>
  );
}

function App() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const newDivCallback = () => {
      if (ref.current) {
        const newDiv = document.createElement("div")
        newDiv.style.height = '30px'
        newDiv.style.width = '30px'
        newDiv.style.backgroundColor = 'red'
        ref.current.appendChild(newDiv)
      }
      console.log("HI");
    };
    window.addEventListener("new div", newDivCallback);
    return () => {
      window.removeEventListener("new div", newDivCallback);
    };
  }, []);

  return (
    <div ref={ref} style={{ height: "100%", width: "100%" }}>
      <Toolbox />
    </div>
  );
}

export default App;
