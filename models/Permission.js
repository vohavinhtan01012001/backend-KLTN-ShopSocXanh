module.exports = (sequelize, DataTypes) => {
    const PhanQuyen = sequelize.define("PhanQuyen", {
        tenQuanLi: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        moTa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });
    PhanQuyen.associate = (models) => {
        PhanQuyen.hasMany(models.VaiTroPhanQuyen, {
            onDelete: "cascade"
        });
    }

    return PhanQuyen;
}