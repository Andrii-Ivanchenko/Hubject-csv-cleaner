document.addEventListener("DOMContentLoaded", function () {
    const csvFileInput = document.getElementById("csvFileInput");
    const processButton = document.getElementById("processButton");
    const downloadLink = document.getElementById("downloadLink");
    const resultDiv = document.getElementById("result");

    processButton.addEventListener("click", function () {
        const file = csvFileInput.files[0];
        if (file) {
            resultDiv.innerHTML = "Processing...";

            const reader = new FileReader();
            reader.onload = function (event) {
                const csvData = event.target.result;
                const cleanedCSV = processCSV(csvData);
                downloadLink.href = URL.createObjectURL(new Blob([cleanedCSV], { type: "text/csv" }));
                downloadLink.style.display = "block";
                resultDiv.innerHTML = "CSV processing completed.";
            };
            reader.readAsText(file);
        }
    });

    function processCSV(csvData) {
        // Split CSV data into lines
        const lines = csvData.split(/\r\n|\n/);

        // Initialize cleaned CSV with the header row and select desired columns
        const headerRow = lines[0].split(";");
        const desiredColumns = [
            "SessionID",
            "Time of Request",
            "Time of Response",
            "OperatorID",
            "EVSEID",
            "UID",
            "Authorization Status",
            "Authorizing Provider ID",
            "Authorization Method"
        ];
        const headerIndexes = desiredColumns.map(column => headerRow.indexOf(column));
        const cleanedCSV = [desiredColumns.join(";")];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // Check if the line starts with the specified format
            if (line.match(/^[A-Za-z0-9]{8}(-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12}/)) {
                // Split the line by semicolon
                const values = line.split(";");
                
                // Remove the content after "ONLINE" or "OFFLINE"
                const authorizationStatusIndex = headerRow.indexOf("Authorization Status");
                if (authorizationStatusIndex !== -1) {
                    values[authorizationStatusIndex] = values[authorizationStatusIndex].split(";ONLINE")[0];
                    values[authorizationStatusIndex] = values[authorizationStatusIndex].split(";OFFLINE")[0];
                }

                // Select only the desired columns
                const selectedValues = headerIndexes.map(index => values[index]);
                
                // Join the selected values with semicolon
                cleanedCSV.push(selectedValues.join(";"));
            }
        }

        // Join cleaned lines to form the cleaned CSV
        return cleanedCSV.join("\n");
    }
});
