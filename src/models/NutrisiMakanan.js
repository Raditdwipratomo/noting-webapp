module.exports = (sequelize, DataTypes) => {
    const NutrisiMakanan = sequelize.define(
        "NutrisiMakanan",
        {
            id_nutrisi: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_detail_makanan: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "detail_makanan_harian",
                    key: "id_detail",
                },
            },
            protein_gram: {
                type: DataTypes.DECIMAL(5,2),
                comment: "dalam gram"
            },
            lemak_gram: {
                type: DataTypes.DECIMAL(5,2),
                comment: "dalam gram"
            },
            karbohidrat_gram: {
                type: DataTypes.DECIMAL(5,2),
                comment: "dalam gram"
            },
            kalsium_mg: {
                type: DataTypes.DECIMAL(6,2),
                comment: "dalam miligram"
            },
            zat_besi_mg: {
                type: DataTypes.DECIMAL(5,2),
                comment: "dalam miligram"
            },
            zinc_mg: {
                type: DataTypes.DECIMAL(5,2),
                comment: "dalam miligram"
            },
            vitamin_a_iu: {
                type: DataTypes.DECIMAL(6,2),
                comment: "dalam international unit"
            },
            vitamin_d_iu: {
                type: DataTypes.DECIMAL(6,2),
                comment: "dalam international unit"
            },
            vitamin_c_mg: {
                type: DataTypes.DECIMAL(5,2),
                comment: "dalam miligram"
            },
            kalori_total: {
                type: DataTypes.INTEGER,
            },
            catatan: {
                type: DataTypes.TEXT
            },
        },
        {
            tableName: "nutrisi_makanan",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    name: "unique_nutrisi",
                    fields: ["id_detail_makanan"]
                },
            ],
        }
    );

    NutrisiMakanan.associate = (models) => {
        NutrisiMakanan.belongsTo(models.DetailMakananHarian, {
            foreignKey: "id_detail_makanan",
            as : "detail_makanan_harian",
            onDelete : "CASCADE",
        });
    };

};