class AddCashBalanceToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :cash_balance, :decimal, default:0
  end
end
