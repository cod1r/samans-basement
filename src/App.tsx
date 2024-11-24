import { useEffect, useRef, useState } from "react";
import "./App.css";

function ContextMenu() {
}

function Button(props: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={props.onClick}
      className="button"
    >
      {props.children}
    </button>
  );
}

function Toolbox() {
  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "min-content",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Button onClick={() => {dispatchEvent(new CustomEvent("new div"))}}>div</Button>
    </div>
  );
}

function App() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pointerDown, setPointerDown] = useState(false);
  const [initialDiff, setInitialDiff] = useState({ x: 0, y: 0 });
  const draggingElementRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!pointerDown && draggingElementRef.current) {
      setInitialDiff({ x: 0, y: 0 });
    }
  }, [pointerDown]);
  useEffect(() => {
    const newDivCallback = () => {
      if (ref.current) {
        const newDiv = document.createElement("div");
        newDiv.style.height = "30px";
        newDiv.style.width = "30px";
        newDiv.style.backgroundColor = "red";
        newDiv.style.position = "absolute";
        newDiv.onpointerdown = () => {
          setPointerDown(true);
          draggingElementRef.current = newDiv;
        };
        ref.current.appendChild(newDiv);
      }
    };
    const contextMenuHandler = (e: MouseEvent) => {
      const element = document.elementFromPoint(e.clientX, e.clientY)
      if (element && element !== ref.current) {
        e.preventDefault()
      }
    }
    window.addEventListener("new div", newDivCallback);
    window.addEventListener("contextmenu", contextMenuHandler)
    return () => {
      window.removeEventListener("new div", newDivCallback);
      window.removeEventListener("contextmenu", contextMenuHandler);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ height: "100%", width: "100%", position: "absolute" }}
      onPointerUp={() => {
        setPointerDown(false);
      }}
      onPointerMove={(e) => {
        if (draggingElementRef.current && pointerDown) {
          let diffX = initialDiff.x;
          let diffY = initialDiff.y;
          if (diffX === 0 && diffY === 0) {
            const boundingBox =
              draggingElementRef.current.getBoundingClientRect();
            diffX = e.clientX - boundingBox.x;
            diffY = e.clientY - boundingBox.y;
          }
          setInitialDiff({ x: diffX, y: diffY });
          draggingElementRef.current.style.transform = `translateX(${e.clientX - diffX}px) translateY(${e.clientY - diffY}px)`;
        }
      }}
    >
      <Toolbox />
    </div>
  );
}

export default App;
