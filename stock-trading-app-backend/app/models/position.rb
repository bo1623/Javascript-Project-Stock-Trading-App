class Position < ApplicationRecord
  belongs_to :stock
  belongs_to :user

  def update_position(quantity,direction,price)
    if direction=="Buy"
      self.size+=quantity
      self.cost=(self.value+quantity*price)/self.size
      self.value=self.size*price
    elsif direction=="Sell"
      self.size-=quantity
      self.value=self.size*price
    end
  end

end
