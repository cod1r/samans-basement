import { useEffect, useRef, useState } from "react";
import "./App.css";

function ContextMenu(props: { forElement: HTMLElement }) {
  const listOfStyles = props.forElement.style;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const boundingBox = props.forElement.getBoundingClientRect();
    setPosition({ x: boundingBox.x, y: boundingBox.y });
  }, [props.forElement]);
  if (position.x === 0 && position.y === 0) return null;
  return (
    <div
      style={{
        width: "max-content",
        height: "min-content",
        backgroundColor: "grey",
        position: "absolute",
        transform: `translate(${position.x + props.forElement.clientWidth}px, ${position.y}px)`,
        overflow: "auto",
      }}
    >
      <ul
        style={{
          height: "100%",
          width: "100%",
          listStyleType: "none",
          padding: 0,
        }}
      >
        {Array.from({ length: listOfStyles.length }, (_, i) => {
          const propertyName = listOfStyles.item(i);
          if (propertyName === "position" || propertyName === "transform")
            return undefined;
          return (
            <li key={`${propertyName}-${i}`}>
              {propertyName}: {listOfStyles.getPropertyValue(propertyName)}
            </li>
          );
        }).filter((e) => e !== undefined)}
      </ul>
    </div>
  );
}

function Button(props: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={props.onClick} className="button">
      {props.children}
    </button>
  );
}

function Toolbox() {
  return (
    <div
      style={{
        top: 0,
        left: 0,
        right: 0,
        position: "fixed",
        width: "100%",
        height: "min-content",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={() => {
          dispatchEvent(new CustomEvent("new div"));
        }}
      >
        div
      </Button>
      <Button
        onClick={() => {
          dispatchEvent(new CustomEvent("new text"));
        }}
      >
        text
      </Button>
    </div>
  );
}

function ListElements() {
  const listOfAddedElements = document.querySelectorAll(".new-element");
  return (
    <div
      style={{
        height: "min-content",
        position: "fixed",
        width: 200,
        right: 0,
        top: 0,
        border: "1px solid black",
      }}
    >
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {[...listOfAddedElements.entries()].map(([idx, element]) => {
          return (
            <li
              key={`${idx}_${element.tagName}`}
              style={{
                userSelect: "none",
                display: "flex",
                alignItems: "center",
              }}
              onPointerOver={() => {
                const htmlelement = element as HTMLElement;
                htmlelement.style.outline = "2px solid lightblue";
                htmlelement.style.outlineOffset = "5px";
              }}
              onPointerOut={() => {
                const htmlelement = element as HTMLElement;
                htmlelement.style.outline = "";
                htmlelement.style.outlineOffset = "";
              }}
            >
              <div>Element: {idx}</div>
              <button
                onClick={() => {
                  element.remove();
                }}
              >
                delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function useFocusedElement(element: HTMLElement | null) {
  if (element === null) return;
}

function App() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [, update] = useState({});
  const [pointerDown, setPointerDown] = useState(false);
  const [initialDiff, setInitialDiff] = useState({ x: 0, y: 0 });
  const [contextMenuElement, setContextMenuElement] =
    useState<HTMLElement | null>(null);
  const draggingElementRef = useRef<HTMLDivElement | null>(null);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null,
  );
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
        newDiv.onpointerdown = (e: PointerEvent) => {
          setPointerDown(true);
          setFocusedElement(newDiv);
          draggingElementRef.current = newDiv;
        };
        newDiv.classList.add("new-element");
        ref.current.appendChild(newDiv);
        update({});
      }
    };
    const contextMenuHandler = (e: MouseEvent) => {
      const element = document.elementFromPoint(
        e.clientX,
        e.clientY,
      ) as HTMLElement;
      if (element && element !== ref.current) {
        e.preventDefault();
        setContextMenuElement(element);
      }
    };
    window.addEventListener("new div", newDivCallback);
    window.addEventListener("contextmenu", contextMenuHandler);
    return () => {
      window.removeEventListener("new div", newDivCallback);
      window.removeEventListener("contextmenu", contextMenuHandler);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        width: "100%",
        position: "absolute",
        overflow: "hidden",
      }}
      onPointerUp={() => {
        setPointerDown(false);
      }}
      onPointerDown={() => {
        setContextMenuElement(null);
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
      <ListElements />
      {contextMenuElement && <ContextMenu forElement={contextMenuElement} />}
    </div>
  );
}

export default App;
