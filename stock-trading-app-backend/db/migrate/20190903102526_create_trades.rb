class CreateTrades < ActiveRecord::Migration[5.2]
  def change
    create_table :trades do |t|
      t.references :stock, foreign_key: true
      t.references :user, foreign_key: true
      t.decimal :price
      t.string :direction
      t.integer :quantity
      t.string :time

      t.timestamps
    end
  end
end
