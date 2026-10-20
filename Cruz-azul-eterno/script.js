
"use strict";

// ==========================================
// CRUZ AZUL ETERNO - SCRIPT PRINCIPAL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // MENÚ PARA CELULARES
    // ==========================================

    const menuToggle = document.getElementById("menuToggle");
    const navegacion = document.getElementById("navegacion");

    if (menuToggle && navegacion) {

        menuToggle.addEventListener("click", () => {
            const abierto = navegacion.classList.toggle("abierto");

            menuToggle.setAttribute("aria-expanded", String(abierto));
            menuToggle.setAttribute(
                "aria-label",
                abierto ? "Cerrar menú" : "Abrir menú"
            );

            menuToggle.textContent = abierto ? "✕" : "☰";
        });

        // Cerrar el menú al seleccionar un enlace.
        navegacion.querySelectorAll("a").forEach((enlace) => {
            enlace.addEventListener("click", () => {
                navegacion.classList.remove("abierto");

                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Abrir menú");
                menuToggle.textContent = "☰";
            });
        });

        // Cerrar el menú con la tecla Escape.
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                navegacion.classList.remove("abierto");

                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Abrir menú");
                menuToggle.textContent = "☰";
            }
        });
    }

    // ==========================================
    // FILTROS DE NOTICIAS
    // ==========================================

    const botonesFiltro = document.querySelectorAll(
        ".filtro, .filtro-btn"
    );

    const tarjetasNoticias = document.querySelectorAll(
        ".noticia-card"
    );

    botonesFiltro.forEach((boton) => {

        boton.addEventListener("click", () => {

            const filtroSeleccionado =
                boton.dataset.filtro || "todos";

            // Actualizar el botón activo.
            botonesFiltro.forEach((elemento) => {
                elemento.classList.remove("activo");
                elemento.setAttribute("aria-pressed", "false");
            });

            boton.classList.add("activo");
            boton.setAttribute("aria-pressed", "true");

            // Mostrar las noticias de la categoría elegida.
            tarjetasNoticias.forEach((tarjeta) => {

                const categoria =
                    tarjeta.dataset.categoria || "";

                const mostrar =
                    filtroSeleccionado === "todos" ||
                    categoria === filtroSeleccionado;

                tarjeta.hidden = !mostrar;
            });
        });
    });

    // ==========================================
    // COMENTARIOS DE AFICIONADOS
    // ==========================================

    const formulario = document.getElementById("comentarioForm");
    const campoNombre = document.getElementById("nombre");
    const campoComentario = document.getElementById("comentario");
    const listaComentarios = document.getElementById("listaComentarios");
    const botonBorrar = document.getElementById("borrarComentarios");

    const CLAVE_COMENTARIOS = "cruzAzulEternoComentarios";

    let comentarios = [];

    // ------------------------------------------
    // CARGAR COMENTARIOS
    // ------------------------------------------

    function cargarComentarios() {

        try {
            const guardados = localStorage.getItem(CLAVE_COMENTARIOS);

            if (guardados) {

                const datos = JSON.parse(guardados);

                if (Array.isArray(datos)) {

                    comentarios = datos
                        .filter((item) =>
                            item &&
                            typeof item.nombre === "string" &&
                            typeof item.texto === "string" &&
                            typeof item.fecha === "string"
                        )
                        .slice(0, 100);
                }
            }

        } catch (error) {
            comentarios = [];

            console.warn(
                "No se pudieron leer los comentarios guardados.",
                error
            );
        }

        mostrarComentarios();
    }

    // ------------------------------------------
    // GUARDAR COMENTARIOS
    // ------------------------------------------

    function guardarComentarios() {

        try {
            localStorage.setItem(
                CLAVE_COMENTARIOS,
                JSON.stringify(comentarios)
            );

            return true;

        } catch (error) {

            console.error(
                "No se pudieron guardar los comentarios.",
                error
            );

            alert(
                "No se pudieron guardar los comentarios. " +
                "Comprueba el almacenamiento del navegador."
            );

            return false;
        }
    }

    // ------------------------------------------
    // MOSTRAR COMENTARIOS
    // ------------------------------------------

    function mostrarComentarios() {

        if (!listaComentarios) {
            return;
        }

        listaComentarios.replaceChildren();

        if (comentarios.length === 0) {

            const mensaje = document.createElement("p");

            mensaje.className = "comentarios-vacio";
            mensaje.textContent =
                "¡Sé el primero en compartir tu pasión celeste!";

            listaComentarios.appendChild(mensaje);

            return;
        }

        comentarios.forEach((comentario) => {

            const tarjeta = document.createElement("article");
            tarjeta.className = "comentario";

            const nombre = document.createElement("strong");
            nombre.textContent = comentario.nombre;

            const texto = document.createElement("p");
            texto.textContent = comentario.texto;

            const fecha = document.createElement("small");
            fecha.className = "comentario-fecha";

            const fechaValida = new Date(comentario.fecha);

            fecha.textContent = Number.isNaN(fechaValida.getTime())
                ? "Comentario de aficionado"
                : fechaValida.toLocaleString("es-MX");

            tarjeta.append(nombre, texto, fecha);
            listaComentarios.appendChild(tarjeta);
        });
    }

    // ------------------------------------------
    // AGREGAR COMENTARIOS
    // ------------------------------------------

    if (
        formulario &&
        campoNombre &&
        campoComentario &&
        listaComentarios
    ) {

        formulario.addEventListener("submit", (evento) => {

            evento.preventDefault();

            const nombre = campoNombre.value.trim();
            const texto = campoComentario.value.trim();

            if (!nombre || !texto) {

                alert("Escribe tu nombre y tu comentario.");

                return;
            }

            if (nombre.length > 40 || texto.length > 500) {

                alert(
                    "El nombre debe tener máximo 40 caracteres " +
                    "y el comentario máximo 500."
                );

                return;
            }

            // Conservar una copia para restaurarla si falla el guardado.
            const comentariosAnteriores = comentarios;

            const comentarioNuevo = {
                nombre: nombre,
                texto: texto,
                fecha: new Date().toISOString()
            };

            comentarios = [
                comentarioNuevo,
                ...comentarios
            ].slice(0, 100);

            if (guardarComentarios()) {

                mostrarComentarios();
                formulario.reset();

            } else {

                // Restaurar los comentarios anteriores si falla el guardado.
                comentarios = comentariosAnteriores;
            }
        });

        cargarComentarios();
    }

    // ==========================================
    // BORRAR COMENTARIOS
    // ==========================================

    if (botonBorrar) {

        botonBorrar.addEventListener("click", () => {

            if (comentarios.length === 0) {

                alert("No hay comentarios guardados para borrar.");

                return;
            }

            const confirmar = confirm(
                "¿Quieres borrar todos los comentarios guardados " +
                "en este navegador?"
            );

            if (!confirmar) {
                return;
            }

            try {

                // Eliminar los comentarios guardados.
                localStorage.removeItem(CLAVE_COMENTARIOS);

                comentarios = [];

                mostrarComentarios();

                alert("Los comentarios se borraron correctamente.");

            } catch (error) {

                console.error(
                    "No fue posible borrar los comentarios.",
                    error
                );

                alert(
                    "No fue posible borrar los comentarios guardados."
                );
            }
        });
    }

});
