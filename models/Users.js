module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("NguoiDung", {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        hoTen: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        matKhau: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        diaChi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sdt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phanQuyen: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    /* User.associate = (models) => {
        User.hasMany(models.Posts, {
            onDelete: "cascade"
        });

        User.hasMany(models.Likes, {
            onDelete: "cascade"
        });
    } */
    return User;
}