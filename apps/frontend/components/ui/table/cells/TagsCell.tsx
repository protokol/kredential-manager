import type { FC } from 'react';

import { generateHexColorFromString } from '@utils/helpers/colors';

import Badge from '@ui/badge/Badge';

type TagsCellProps = {
  tags?: string[];
};
const TagsCell: FC<TagsCellProps> = ({ tags = [] }) => {
  const tagCount = tags.length;
  if (!tagCount) return null;

  if (tagCount > 2) {
    const firstTag = tags[0];
    const tagColor = generateHexColorFromString(firstTag);
    return (
      <div className='inline-flex gap-2'>
        <Badge variant='custom' color={tagColor}>
          {firstTag}
        </Badge>
        <Badge variant='gray'>{`+${tagCount - 1} more`}</Badge>
      </div>
    );
  }

  return (
    <div className='inline-flex gap-2'>
      {tags.map((tag) => {
        const tagColor = generateHexColorFromString(tag);

        return (
          <Badge key={tag} variant='custom' color={tagColor}>
            {tag}
          </Badge>
        );
      })}
    </div>
  );
};

export default TagsCell;
