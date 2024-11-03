<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "pos";

// Connect to database
$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $category = $_POST["category"];
    $name = $_POST["name"];
    $price = $_POST["price"];
    
    // Handle image upload
    $target_dir = "uploads/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    
    $imageFileType = strtolower(pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION));
    $imageName = uniqid() . '.' . $imageFileType;
    $target_file = $target_dir . $imageName;

    if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        $imagePath = $target_file;

        // Insert data into the stock table
        $sql = "INSERT INTO stock (category, name, price, image) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssis", $category, $name, $price, $imagePath);

        if ($stmt->execute()) {
            echo "Product added successfully!";
        } else {
            echo "Error: " . $stmt->error;
        }
        
        $stmt->close();
    } else {
        echo "Failed to upload image.";
    }
}

$conn->close();
?>
