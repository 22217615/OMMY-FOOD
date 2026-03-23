<?php
// admin/orders.php
session_start();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login-test.php');
    exit;
}

include '../api/config.php';

// Mettre à jour le statut d'une commande
if (isset($_POST['update_status']) && isset($_POST['order_id']) && isset($_POST['status'])) {
    $orderId = $_POST['order_id'];
    $status = $_POST['status'];
    
    $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $status, ':id' => $orderId]);
    
    header('Location: orders.php');
    exit;
}

// Récupérer toutes les commandes
$orders = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commandes - OMMY-FOOD Admin</title>
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
                <li><a href="index.php"><i class="fas fa-tachometer-alt"></i> Tableau de bord</a></li>
                <li class="active"><a href="orders.php"><i class="fas fa-shopping-cart"></i> Commandes</a></li>
                <li><a href="contacts.php"><i class="fas fa-envelope"></i> Messages</a></li>
                <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
            </ul>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <div class="top-bar">
                <h1>Gestion des commandes</h1>
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <?= htmlspecialchars($_SESSION['admin_username']) ?>
                </div>
            </div>
            
            <div class="filter-bar">
                <input type="text" id="search" placeholder="🔍 Rechercher un client..." onkeyup="filterOrders()">
                <select id="status-filter" onchange="filterOrders()">
                    <option value="">📊 Tous les statuts</option>
                    <option value="en_attente">⏳ En attente</option>
                    <option value="paye">✅ Payé</option>
                    <option value="en_livraison">🚚 En livraison</option>
                    <option value="livre">🏠 Livré</option>
                    <option value="annule">❌ Annulé</option>
                </select>
            </div>
            
            <div class="recent-orders">
                <h2>📋 Toutes les commandes</h2>
                <div style="overflow-x: auto;">
                    <table id="orders-table">
                        <thead>
                            <tr>
                                <th>N° commande</th>
                                <th>Client</th>
                                <th>Téléphone</th>
                                <th>Total</th>
                                <th>Paiement</th>
                                <th>Statut</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($orders) > 0): ?>
                                <?php foreach ($orders as $order): ?>
                                <tr class="order-row" data-status="<?= $order['status'] ?>" data-name="<?= strtolower($order['customer_name']) ?>">
                                    <td><strong>#<?= $order['order_number'] ?></strong></td>
                                    <td><?= htmlspecialchars($order['customer_name']) ?></td>
                                    <td><?= htmlspecialchars($order['customer_phone']) ?></td>
                                    <td><strong><?= number_format($order['total'], 0) ?> FC</strong></td>
                                    <td>
                                        <?php if ($order['payment_mode'] == 'online'): ?>
                                            <span class="badge badge-online">📱 Mobile Money</span>
                                            <?php if ($order['payment_operator']): ?>
                                                <br><small>(<?= $order['payment_operator'] ?>)</small>
                                            <?php endif; ?>
                                        <?php else: ?>
                                            <span class="badge badge-cash">💰 Cash</span>
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <form method="POST" style="display: inline-flex; gap: 0.3rem;">
                                            <input type="hidden" name="order_id" value="<?= $order['id'] ?>">
                                            <select name="status" class="status-select">
                                                <option value="en_attente" <?= $order['status'] == 'en_attente' ? 'selected' : '' ?>>⏳ En attente</option>
                                                <option value="paye" <?= $order['status'] == 'paye' ? 'selected' : '' ?>>✅ Payé</option>
                                                <option value="en_livraison" <?= $order['status'] == 'en_livraison' ? 'selected' : '' ?>>🚚 En livraison</option>
                                                <option value="livre" <?= $order['status'] == 'livre' ? 'selected' : '' ?>>🏠 Livré</option>
                                                <option value="annule" <?= $order['status'] == 'annule' ? 'selected' : '' ?>>❌ Annulé</option>
                                            </select>
                                            <button type="submit" name="update_status" class="btn-update">
                                                <i class="fas fa-save"></i>
                                            </button>
                                        </form>
                                    </td>
                                    <td><?= date('d/m/Y H:i', strtotime($order['created_at'])) ?></td>
                                    <td>
                                        <a href="order-detail.php?id=<?= $order['id'] ?>" class="btn-view">
                                            <i class="fas fa-eye"></i> Détail
                                        </a>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="8" style="text-align: center; padding: 2rem;">
                                        📭 Aucune commande pour le moment
                                    </td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function filterOrders() {
            const searchValue = document.getElementById('search').value.toLowerCase();
            const statusValue = document.getElementById('status-filter').value;
            const rows = document.querySelectorAll('.order-row');
            
            rows.forEach(row => {
                const name = row.getAttribute('data-name');
                const status = row.getAttribute('data-status');
                
                const matchesSearch = name.includes(searchValue);
                const matchesStatus = statusValue === '' || status === statusValue;
                
                if (matchesSearch && matchesStatus) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>