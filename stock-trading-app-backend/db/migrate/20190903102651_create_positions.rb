class CreatePositions < ActiveRecord::Migration[5.2]
  def change
    create_table :positions do |t|
      t.integer :size
      t.references :stock, foreign_key: true
      t.references :user, foreign_key: true
      t.decimal :cost
      t.decimal :value
      t.decimal :realized
      t.decimal :unrealized

      t.timestamps
    end
  end
end
