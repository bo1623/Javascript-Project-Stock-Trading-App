class CreatePositions < ActiveRecord::Migration[5.2]
  def change
    create_table :positions do |t|
      t.integer :size, default:0
      t.references :stock, foreign_key: true
      t.references :user, foreign_key: true
      t.decimal :cost, default:0
      t.decimal :value, default:0
      t.decimal :realized, default:0
      t.decimal :unrealized, default:0

      t.timestamps
    end
  end
end
