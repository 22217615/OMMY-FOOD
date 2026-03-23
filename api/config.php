<?php
// api/config.php
// Fichier de connexion à la base de données

$host = 'localhost';
$dbname = 'ommyfood_db';
$username = 'root';
$password = ''; // Sous XAMPP, le mot de passe est vide

try {
    // Créer la connexion
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Configurer PDO pour afficher les erreurs
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Pour tester (on verra plus tard)
    // echo "Connexion réussie !";
    
} catch(PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>