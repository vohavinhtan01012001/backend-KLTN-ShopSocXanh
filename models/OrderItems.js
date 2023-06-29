module.exports = (sequelize, DataTypes) => {
    const ChiTietDonHang = sequelize.define("ChiTietDonHang", {
        soLuongM: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        soLuongL: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        soLuongXL: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        giaTien: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        tongTien: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    });

    ChiTietDonHang.associate = (models) => {
        ChiTietDonHang.belongsTo(models.SanPham);
    }

    return ChiTietDonHang;
}