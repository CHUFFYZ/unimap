/*--Mostrar Afi-----------------------------------------------------------------------------*/
document.getElementById("searchForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Evitar el envío normal del formulario
    const month1 = document.getElementById("month1").value;
  
    fetch(`../mostraafi2.php?month1=${month1}`)
        .then(response => response.text())
        .then(data => {
            document.getElementById("results").innerHTML = data; // Mostrar resultados
        })
        .catch(error => console.error("Error:", error));
  });
  