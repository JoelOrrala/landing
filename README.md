# Agentic-OS

Autor: Joel Orrala

## 1. Descripcion general

Agentic-OS simula una arquitectura de sistema operativo basada en procesos y agentes de IA.

El programa principal es `launcher`, que crea y monitorea un proceso servidor llamado `IALearner` y N ventanas graficas X11. Cada ventana captura las teclas escritas por el usuario y las envia a `IALearner` mediante sockets TCP locales.

`IALearner` reconstruye palabras y oraciones, genera vectores de frecuencia con la tecnica bag of words, clasifica cada documento y finalmente infiere el tipo de usuario.

## 2. Requisitos

El proyecto fue desarrollado para Linux y requiere:

- gcc
- make
- pthreads
- libreria de desarrollo de X11

Instalacion recomendada en Ubuntu:

```bash
sudo apt update
sudo apt install build-essential libx11-dev
```

## 3. Estructura del proyecto

```text
AgenticOS/
├── Makefile
├── README.md
├── src/
│   ├── launcher.c
│   ├── ialearner.c
│   └── x11_agent_window.c
└── logs/              
```

## 4. Compilacion

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

Tambien se puede compilar manualmente con gcc:

```bash
gcc -Wall -Wextra -g src/ialearner.c -o ialearner -pthread
gcc -Wall -Wextra -g src/x11_agent_window.c -o x11_agent_window -lX11
gcc -Wall -Wextra -g src/launcher.c -o launcher
```

## 5. Ejecucion

La forma principal de ejecutar el proyecto es mediante el launcher:

```bash
./launcher
```

Tambien se puede usar:

```bash
make run
```

Al iniciar, el launcher solicita:

- Numero de ventanas X11.
- Puerto para IALearner.

Si se presiona Enter, se usan los valores por defecto:

- 3 ventanas.
- Puerto 5050.

El sistema permite crear hasta 100 ventanas X11 por ejecucion. Este limite se define para evitar agotamiento de recursos del sistema, como procesos, sockets, hilos y ventanas graficas.

## 6. Uso del programa

1. Ejecutar el programa:

```bash
./launcher
```

2. Escribir texto dentro de cada ventana X11.

3. Presionar Enter dentro de la ventana para terminar una oracion.

4. Presionar Escape para cerrar una ventana de forma normal.

5. Usar el menu del launcher para monitorear o cerrar procesos.

Menu principal:

```text
1. Listar procesos monitoreados
2. Terminar una ventana por ID
3. Cerrar procesos y salir
```

El launcher muestra el PID, rol, estado interno y estado Linux de cada proceso. El estado Linux se obtiene desde:

```text
/proc/<pid>/stat
```

## 7. Logs

Los detalles de ejecucion se guardan en la carpeta:

```text
logs/
```

Archivos principales:

```text
logs/ialearner.log
logs/window_1.log
logs/window_2.log
...
```

`logs/ialearner.log` contiene:

- palabras detectadas;
- oraciones reconstruidas;
- vectores bag of words por linea;
- resultados de clasificacion;
- contexto final del usuario.

Ejemplo de vector registrado:

```text
[Cliente 1] [VECTOR LINEA 1] Correo electronico=3 | Articulo cientifico=0 | Reporte=0
```

`logs/window_N.log` contiene las teclas capturadas por cada ventana.

La consola mantiene visible la informacion principal:

- procesos monitoreados;
- clasificacion de cada cliente;
- contexto final del usuario.

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
