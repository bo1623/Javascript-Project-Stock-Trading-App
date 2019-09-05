class User < ApplicationRecord
  has_many :trades
  has_many :positions
end
