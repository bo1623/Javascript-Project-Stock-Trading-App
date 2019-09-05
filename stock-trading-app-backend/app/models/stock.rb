class Stock < ApplicationRecord
  has_many :positions
  has_many :trades
end
