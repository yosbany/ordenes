// Previous imports remain the same...

export function ProductCard({ 
  // Props remain the same...
}) {
  // Previous state and handlers remain the same...

  return (
    <>
      <Card isSelected={isSelected}>
        <Card.Header className="!p-3">
          <div className="flex items-start justify-between gap-2">
            {/* Previous JSX remains the same until the price display */}
            
            <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
              ${formatPrice(product.price)}
            </span>
          </div>
        </Card.Header>

        {/* Rest of JSX remains the same */}
      </Card>

      {/* Modal remains the same */}
    </>
  );
}