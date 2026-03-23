<?php
// admin/index.php
session_start();

// Vérifier si l'admin est connecté
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login-test.php');
    exit;
}

include '../api/config.php';

// Statistiques
$totalOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$pendingOrders = $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'en_attente'")->fetchColumn();
$totalRevenue = $pdo->query("SELECT SUM(total) FROM orders")->fetchColumn();
$totalContacts = $pdo->query("SELECT COUNT(*) FROM contacts")->fetchColumn();

// Dernières commandes
$recentOrders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - OMMY-FOOD Admin</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="dashboard">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>🍽️ OMMY-FOOD</h2>
                <p>Administration</p>
            </div>
            <ul class="sidebar-menu">
                <li class="active"><a href="index.php"><i class="fas fa-tachometer-alt"></i> Tableau de bord</a></li>
                <li><a href="orders.php"><i class="fas fa-shopping-cart"></i> Commandes</a></li>
                <li><a href="contacts.php"><i class="fas fa-envelope"></i> Messages</a></li>
                <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
            </ul>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <div class="top-bar">
                <h1>Tableau de bord</h1>
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <?= htmlspecialchars($_SESSION['admin_username']) ?>
                </div>
            </div>
            
            <!-- Statistiques -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                    <div class="stat-info">
                        <h3><?= $totalOrders ?></h3>
                        <p>Commandes totales</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
                    <div class="stat-info">
                        <h3><?= $pendingOrders ?></h3>
                        <p>En attente</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                    <div class="stat-info">
                        <h3><?= number_format($totalRevenue, 0) ?> FC</h3>
                        <p>Chiffre d'affaires</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                    <div class="stat-info">
                        <h3><?= $totalContacts ?></h3>
                        <p>Messages reçus</p>
                    </div>
                </div>
            </div>
            
            <!-- Dernières commandes -->
            <div class="recent-orders">
                <h2>📦 Dernières commandes</h2>
                <?php if (count($recentOrders) > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>N° commande</th>
                            <th>Client</th>
                            <th>Total</th>
                            <th>Statut</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($recentOrders as $order): ?>
                        <tr>
                            <td>#<?= $order['order_number'] ?></td>
                            <td><?= htmlspecialchars($order['customer_name']) ?></td>
                            <td><?= number_format($order['total'], 0) ?> FC</td>
                            <td>
                                <span class="status <?= $order['status'] ?>">
                                    <?php
                                    $statusLabels = [
                                        'en_attente' => 'En attente',
                                        'paye' => 'Payé',
                                        'en_livraison' => 'En livraison',
                                        'livre' => 'Livré',
                                        'annule' => 'Annulé'
                                    ];
                                    echo $statusLabels[$order['status']] ?? $order['status'];
                                    ?>
                                </span>
                            </td>
                            <td><?= date('d/m/Y H:i', strtotime($order['created_at'])) ?></td>
                            <td>
                                <a href="order-detail.php?id=<?= $order['id'] ?>" class="btn-view">
                                    <i class="fas fa-eye"></i> Voir
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php else: ?>
                <p>Aucune commande pour le moment.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html>