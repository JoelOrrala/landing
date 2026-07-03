Agentic-OS
Autor: Joel Orrala

1. Descripcion general

Este proyecto simula un sistema operativo con un proceso central llamado IALearner. El launcher crea y monitorea varios procesos: un servidor IALearner y N ventanas X11. Cada ventana captura las teclas escritas por el usuario y las envia a IALearner mediante sockets TCP locales. IALearner reconstruye palabras y oraciones, clasifica cada texto con bag of words y finalmente infiere el tipo de usuario.

2. Requisitos

El programa fue desarrollado para Linux y requiere gcc, pthreads y la libreria de desarrollo de X11.

Instalacion recomendada en Ubuntu:

sudo apt update
sudo apt install build-essential libx11-dev

3. Estructura esperada del proyecto

AgenticOS/
├── Makefile
├── README.txt
├── src/
│   ├── launcher.c
│   ├── ialearner.c
│   └── x11_agent_window.c
└── logs/              Se crea automaticamente al ejecutar el programa

4. Compilacion

Para compilar todos los programas:

make

Esto genera los siguientes ejecutables:

launcher
ialearner
x11_agent_window

Tambien se puede compilar manualmente con gcc:

gcc -Wall -Wextra -g src/ialearner.c -o ialearner -pthread
gcc -Wall -Wextra -g src/x11_agent_window.c -o x11_agent_window -lX11
gcc -Wall -Wextra -g src/launcher.c -o launcher

5. Ejecucion

La forma principal de ejecutar el proyecto es mediante el launcher:

./launcher

Tambien se puede usar:

make run

Al iniciar, el launcher solicita:
- Numero de ventanas X11.
- Puerto para IALearner.

Si se presiona Enter, se usan los valores por defecto:
- 3 ventanas.
- Puerto 5050.

6. Uso del programa

1. Ejecutar ./launcher.
2. Escribir texto dentro de cada ventana X11.
3. Presionar Enter en la ventana para terminar una oracion.
4. Presionar Escape para cerrar una ventana.
5. Desde el launcher se pueden listar procesos, terminar una ventana, esperar a que todo finalice o salir limpiamente.

El launcher muestra los PID, el rol de cada proceso, su estado interno y el estado obtenido desde /proc/<pid>/stat.

7. Logs

Los detalles de ejecucion se guardan en la carpeta logs/.

Archivos principales:
- logs/ialearner.log: palabras detectadas, oraciones reconstruidas y resultados registrados.
- logs/window_1.log, logs/window_2.log, etc.: teclas capturadas por cada ventana.

La consola mantiene visible la informacion principal:
- Estado de los procesos.
- Clasificacion de cada cliente.
- Contexto final del usuario.

8. Limpieza

Para eliminar ejecutables:

make clean

Para eliminar logs:

make clean-logs

Para eliminar ejecutables y logs:

make clean-all

9. Notas

- El programa usa fork/exec para crear procesos desde el launcher.
- IALearner usa pthreads para atender varias ventanas de manera concurrente.
- La comunicacion entre ventanas e IALearner se realiza con sockets TCP en 127.0.0.1.
- El launcher usa waitpid para evitar procesos zombie.
- Si se elige salir limpiamente desde el launcher, las ventanas pueden aparecer como terminadas por signal=15, lo cual corresponde a SIGTERM y es esperado.
