class Position < ApplicationRecord
  belongs_to :stock
  belongs_to :user

  def update_position(quantity: ,direction: ,price:)
    if direction=="Buy"
      self.size+=quantity
      self.cost=(self.value+quantity*price)
      self.value=self.size*price
    elsif direction=="Sell"
      avg_cost=self.cost/self.size
      self.size-=quantity
      self.value=(self.size)*price #need to check if the change to self.size has already been reflected in subsequent calcs
      self.unrealized=(self.size)*(price-avg_cost)
      self.cost=avg_cost*(self.size)
      self.realized+=quantity*(price-avg_cost)
    end
    self.save
  end

  def update_unrealized(price:)
    self.value=price*self.size
    self.unrealized = price*self.size-self.cost
    self.save
  end

end
