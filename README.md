# Agentic-OS

**Autor:** Joel Orrala

## 1. Descripción general

Este proyecto simula un sistema operativo con un proceso central llamado **IALearner**.

El `launcher` crea y monitorea varios procesos: un servidor `IALearner` y **N ventanas X11**. Cada ventana captura las teclas escritas por el usuario y las envía a `IALearner` mediante sockets TCP locales.

`IALearner` reconstruye palabras y oraciones, clasifica cada texto usando **bag of words** y finalmente infiere el tipo de usuario.

## 2. Requisitos

El programa fue desarrollado para Linux y requiere:

* `gcc`
* `pthreads`
* Librería de desarrollo de X11

Instalación recomendada en Ubuntu:

```bash
sudo apt update
sudo apt install build-essential libx11-dev
```

## 3. Estructura esperada del proyecto

```text
AgenticOS/
├── Makefile
├── README.md
├── src/
│   ├── launcher.c
│   ├── ialearner.c
│   └── x11_agent_window.c
└── logs/              Se crea automáticamente al ejecutar el programa
```

## 4. Compilación

Para compilar todos los programas:

```bash
make
```

Esto genera los siguientes ejecutables:

```text
launcher
ialearner
x11_agent_window
```

También se puede compilar manualmente con `gcc`:

```bash
gcc -Wall -Wextra -g src/ialearner.c -o ialearner -pthread
gcc -Wall -Wextra -g src/x11_agent_window.c -o x11_agent_window -lX11
gcc -Wall -Wextra -g src/launcher.c -o launcher
```

## 5. Ejecución

La forma principal de ejecutar el proyecto es mediante el `launcher`:

```bash
./launcher
```

También se puede usar:

```bash
make run
```

Al iniciar, el `launcher` solicita:

* Número de ventanas X11.
* Puerto para `IALearner`.

Si se presiona `Enter`, se usan los valores por defecto:

* 3 ventanas.
* Puerto 5050.

## 6. Uso del programa

1. Ejecutar el programa:

```bash
./launcher
```

2. Escribir texto dentro de cada ventana X11.

3. Presionar `Enter` en la ventana para terminar una oración.

4. Presionar `Escape` para cerrar una ventana.

5. Desde el `launcher` se pueden realizar varias acciones, como:

* Listar procesos.
* Terminar una ventana.
* Esperar a que todo finalice.
* Salir limpiamente.

El `launcher` muestra los PID, el rol de cada proceso, su estado interno y el estado obtenido desde:

```text
/proc/<pid>/stat
```

## 7. Logs

Los detalles de ejecución se guardan en la carpeta:

```text
logs/
```

Archivos principales:

* `logs/ialearner.log`: palabras detectadas, oraciones reconstruidas y resultados registrados.
* `logs/window_1.log`, `logs/window_2.log`, etc.: teclas capturadas por cada ventana.

La consola mantiene visible la información principal:

* Estado de los procesos.
* Clasificación de cada cliente.
* Contexto final del usuario.

## 8. Limpieza

Para eliminar ejecutables:

```bash
make clean
```

Para eliminar logs:

```bash
make clean-logs
```

Para eliminar ejecutables y logs:

```bash
make clean-all
```

## 9. Notas

* El programa usa `fork/exec` para crear procesos desde el `launcher`.
* `IALearner` usa `pthreads` para atender varias ventanas de manera concurrente.
* La comunicación entre ventanas e `IALearner` se realiza con sockets TCP en `127.0.0.1`.
* El `launcher` usa `waitpid` para evitar procesos zombie.
* Si se elige salir limpiamente desde el `launcher`, las ventanas pueden aparecer como terminadas por `signal=15`, lo cual corresponde a `SIGTERM` y es esperado.
