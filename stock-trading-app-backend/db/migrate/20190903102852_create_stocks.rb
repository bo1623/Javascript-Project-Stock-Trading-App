class CreateStocks < ActiveRecord::Migration[5.2]
  def change
    create_table :stocks do |t|
      t.string :ticker
      t.decimal :latest_price
      t.string :name
      t.integer :shares_outstanding
      t.decimal :year_low
      t.decimal :year_high
      t.decimal :pe_ratio
      t.decimal :market_cap
      t.decimal :beta
      t.decimal :eps
      t.decimal :div_yield

      t.timestamps
    end
  end
end
