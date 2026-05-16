from app.routes import admin, auth, menus, orders, payments, restaurants, tables, users

routers = (
    auth.router,
    users.router,
    restaurants.router,
    tables.router,
    menus.router,
    orders.router,
    payments.router,
    admin.router,
)

