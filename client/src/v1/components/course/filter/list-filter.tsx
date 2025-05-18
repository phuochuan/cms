import { useState } from "react";
import FilterItemComponent from "./filter-item.tsx";
import { FilterItemType } from "../../user/main-content.tsx";
import SeemoreButton from "./seemore-button.tsx";

type PropsType = {
    list: FilterItemType[];
    setList: (list: FilterItemType[]) => void;
    isMultipleChoice?: boolean;
};

export default function ListFilterItem(props: PropsType) {
    const initialDisplayCount = 5;
    const [displayCount, setDisplayCount] = useState(initialDisplayCount);

    const toggleItemCheck = (itemId: string) => {
        const newListCheckBox = props.list.map((item) => {
            if (props.isMultipleChoice === false) {
                if (item.id === itemId) {
                    return { ...item, checked: true };
                } else {
                    return { ...item, checked: false };
                }
            } else {
                if (item.id === itemId) {
                    return { ...item, checked: !item.checked };
                }
                return item;
            }
        });
        props.setList(newListCheckBox);
    };

    return (
        <div className='flex flex-col gap-3'>
            {props.list.slice(0, displayCount).map((item) => (
                <FilterItemComponent
                    isMultipleChoice={props.isMultipleChoice}
                    key={item.id}
                    prop={item}
                    onClick={() => {
                        toggleItemCheck(item.id);
                    }}
                />
            ))}
            {props.list.length > initialDisplayCount && (
                <SeemoreButton
                    length={props.list.length}
                    initital={initialDisplayCount}
                    displayCount={displayCount}
                    setDisplayCount={setDisplayCount}
                />
            )}
        </div>
    );
}
