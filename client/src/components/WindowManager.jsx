import React from 'react';
import Window from './Window';

export default function WindowManager({ windows, setWindows, zRef }) {
  const bringToFront = (id) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, zIndex: zRef.current++ } : w
      )
    );
  };

  const close = (id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const minimize = (id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  };

  const maximize = (id) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      )
    );
  };

  const drag = (id, pos) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: pos } : w))
    );
  };

  return (
    <>
      {windows.map((w) => (
        <Window
          key={w.id}
          id={w.id}
          title={w.title}
          zIndex={w.zIndex}
          position={w.position}
          minimized={w.minimized}
          maximized={w.maximized}
          content={<w.component />}
          onClose={close}
          onMinimize={minimize}
          onMaximize={maximize}
          onFocus={bringToFront}
          onDrag={drag}
        />
      ))}
    </>
  );
}
