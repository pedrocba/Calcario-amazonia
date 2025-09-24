import React, { useState, useEffect, useRef } from 'react';

// Hook customizado para executar uma função em intervalos
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Lembrar o último callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurar o intervalo.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}