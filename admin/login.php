<?php
// admin/login-new.php
session_start();

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: index.php');
    exit;
}

include '../api/config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['user'] ?? '');
    $pass = trim($_POST['pass'] ?? '');
    
    if (!empty($user) && !empty($pass)) {
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = :username AND password = MD5(:password)");
        $stmt->execute([':username' => $user, ':password' => $pass]);
        $admin = $stmt->fetch();
        
        if ($admin) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $admin['username'];
            header('Location: index.php');
            exit;
        } else {
            $error = "Identifiants incorrects";
        }
    } else {
        $error = "Veuillez remplir tous les champs";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Connexion Admin</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }
        body {
            background: linear-gradient(135deg, #0077b6, #00b4d8);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .login-box {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            width: 100%;
            max-width: 350px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }
        .login-box h1 {
            color: #0077b6;
            margin-bottom: 0.5rem;
        }
        .login-box p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 0.5rem;
            border-radius: 5px;
            margin-bottom: 1rem;
        }
        input {
            width: 100%;
            padding: 0.8rem;
            margin: 0.5rem 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
        }
        button {
            width: 100%;
            padding: 0.8rem;
            background: #0077b6;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            margin-top: 0.5rem;
        }
        button:hover {
            background: #005f92;
        }
        .info {
            margin-top: 1rem;
            font-size: 0.8rem;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <h1>🍽️ OMMY-FOOD</h1>
        <p>Administration</p>
        
        <?php if ($error): ?>
            <div class="error"><?= $error ?></div>
        <?php endif; ?>
        
        <form method="POST">
            <input type="text" name="user" placeholder="Nom d'utilisateur" autocomplete="off" required>
            <input type="password" name="pass" placeholder="Mot de passe" autocomplete="off" required>
            <button type="submit">Se connecter</button>
        </form>
        <div class="info">
            🔑 admin / ommyfood2024
        </div>
    </div>
</body>
</html>