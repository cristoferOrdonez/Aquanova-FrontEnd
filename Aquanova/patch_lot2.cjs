const fs = require('fs');
const file = 'src/components/PublicForm/components/LotSelectorField.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /\{block\.lots\.map\(\(lot\) => \{([\s\S]*?)return \([\s\S]*?<path[\s\S]*?onClick=\{.*?\}[\s]*?\/>[\s]*?\);[\s]*?\}\)\}/m;

const replacement = `{block.lots.map((lot) => {
                          const isSelected = selectedLot?.id === lot.id;
                          const isAvailable = lot.available;

                          let baseColor = STATUS_COLORS[lot.status] || '#9E9E9E';
                          if (lot.property_state && PROPERTY_STATE_COLORS[lot.property_state]) {
                            baseColor = PROPERTY_STATE_COLORS[lot.property_state];
                          }

                          let activeColor = '#1976D2';
                          if (isSelected) {
                            const answeredState = Object.values(formResponses || {}).find(ans => PROPERTY_STATE_COLORS[ans]);
                            if (answeredState) {
                              activeColor = PROPERTY_STATE_COLORS[answeredState];
                            } else if (lot.property_state && PROPERTY_STATE_COLORS[lot.property_state]) {
                              activeColor = PROPERTY_STATE_COLORS[lot.property_state];
                            }
                          }

                          return (
                            <path
                              key={lot.id}
                              d={lot.path}
                              fill={isSelected ? activeColor : baseColor}
                              stroke={isSelected ? '#0D47A1' : '#ffffff'}
                              strokeWidth={isSelected ? 1.5 : 0.5}
                              opacity={isSelected ? 1 : isAvailable ? 0.9 : 0.4}
                              style={{
                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                transition: 'fill 0.15s, opacity 0.15s',
                              }}
                              onClick={() => handleLotSelect(lot)}
                            />
                          );
                        })}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('PATCH APPLIED');
} else {
  console.log('REGEX NOT FOUND');
}
