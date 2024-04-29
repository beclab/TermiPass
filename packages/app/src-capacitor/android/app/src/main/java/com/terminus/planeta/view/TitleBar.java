package com.terminus.planeta.view;

import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;


import com.terminus.planeta.R;
import com.terminus.planeta.utils.Utils;

import androidx.annotation.DrawableRes;

/**
 * <pre>
 *     @author : bytetrade
 *     e-mail : zyh2433219116@gmail.com
 *     time   : 2023/01/06
 *     desc   :
 *     version: 1.0
 * </pre>
 */
public class TitleBar extends RelativeLayout implements View.OnClickListener, Runnable {

    private TextView mLeftView;
    private TextView mTitleView;
    private TextView mRightView;

    private View mLineView;

    int mPaddingLeft;

    private OnTitleBarClickListener mListener;

    public TitleBar(Context context) {
        this(context, null);
    }

    public TitleBar(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public TitleBar(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initView(context);
        initStyle(attrs);
    }

    private void initView(Context context) {
        Builder builder = new Builder(context);
        mLineView = builder.getLineView();
        mTitleView = builder.getTitleView();
        mLeftView = builder.getLeftView();
        mRightView = builder.getRightView();

        addView(mLeftView);
        addView(mTitleView);
        addView(mRightView);
        addView(mLineView);
    }

    static class Builder {

        private RelativeLayout mMainLayout;
        private TextView mLeftView;
        private TextView mTitleView;
        private TextView mRightView;

        private View mLineView;

        Builder(Context context) {

            mMainLayout = new RelativeLayout(context);
            mMainLayout.setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

            mLeftView = new TextView(context);
            mLeftView.setLayoutParams(new ViewGroup.LayoutParams(Utils.dip2px(context,80) , ViewGroup.LayoutParams.MATCH_PARENT));
            mLeftView.setPadding(Utils.dip2px(context,10), 0, Utils.dip2px(context,10), 0);
            mLeftView.setCompoundDrawablePadding(Utils.dip2px(context,5));
            mLeftView.setGravity(Gravity.CENTER_VERTICAL);
            mLeftView.setMaxLines(1);
            mLeftView.setEllipsize(TextUtils.TruncateAt.END);
            mLeftView.setEnabled(false);

            mTitleView = new TextView(context);
            LayoutParams titleParams = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.MATCH_PARENT);
            titleParams.leftMargin = Utils.dip2px(context,80);
            titleParams.rightMargin = Utils.dip2px(context,80);
            titleParams.addRule(RelativeLayout.CENTER_IN_PARENT);
            mTitleView.setLayoutParams(titleParams);
            mTitleView.setGravity(Gravity.CENTER);
            mTitleView.setMaxLines(1);
            mTitleView.setEllipsize(TextUtils.TruncateAt.END);
            mTitleView.setEnabled(false);

            mRightView = new TextView(context);
            LayoutParams rightParams = new LayoutParams(Utils.dip2px(context,80), ViewGroup.LayoutParams.MATCH_PARENT);
            rightParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
            mRightView.setLayoutParams(rightParams);
            mRightView.setPadding(Utils.dip2px(context,10), 0, Utils.dip2px(context,10), 0);
            mRightView.setCompoundDrawablePadding(5);
            mRightView.setGravity(Gravity.CENTER_VERTICAL | Gravity.END);
            mRightView.setMaxLines(1);
            mRightView.setEllipsize(TextUtils.TruncateAt.END);
            mRightView.setEnabled(false);

            mLineView = new View(context);
            LayoutParams lineParams = new LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getLineHeight(context));
            lineParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
            mLineView.setLayoutParams(lineParams);
        }

        RelativeLayout getMainLayout() {
            return mMainLayout;
        }

        View getLineView() {
            return mLineView;
        }

        TextView getLeftView() {
            return mLeftView;
        }

        TextView getTitleView() {
            return mTitleView;
        }

        TextView getRightView() {
            return mRightView;
        }

        /**
         * 获取ActionBar的高度
         */
        static int getActionBarHeight(Context context) {
            TypedArray ta = context.obtainStyledAttributes(new int[]{android.R.attr.actionBarSize});
            int actionBarSize = (int) ta.getDimension(0, 0);
            ta.recycle();
            return actionBarSize;
        }

        /**
         * 获取Line的高度
         */
        static int getLineHeight(Context context) {
            return Utils.dip2px(context,2);
        }
    }

    private void initStyle(AttributeSet attrs) {

        if (attrs == null) return;

        TypedArray ta = getContext().obtainStyledAttributes(attrs, R.styleable.TitleBar);

        //标题设置

        if (ta.hasValue(R.styleable.TitleBar_title_left)) {
            setLeftTitle(ta.getString(R.styleable.TitleBar_title_left));
        }

        if (ta.hasValue(R.styleable.TitleBar_title)) {
            setTitle(ta.getString(R.styleable.TitleBar_title));
        } else {
            //如果当前上下文对象是Activity，就获取Activity的标题
            if (getContext() instanceof Activity) {
                //获取清单文件中的label属性值
                CharSequence label = ((Activity) getContext()).getTitle();
                //如果Activity没有设置label属性，则默认会返回APP名称，需要过滤掉
                if (label != null && !label.toString().equals("")) {

                    try {
                        PackageManager packageManager = getContext().getPackageManager();
                        PackageInfo packageInfo = packageManager.getPackageInfo(
                                getContext().getPackageName(), 0);

                        if (!label.toString().equals(packageInfo.applicationInfo.loadLabel(packageManager).toString())) {
                            setTitle(label);
                        }
                    } catch (PackageManager.NameNotFoundException e) {
                        e.printStackTrace();
                    }
                }
            }
        }

        if (ta.hasValue(R.styleable.TitleBar_title_right)) {
            setRightTitle(ta.getString(R.styleable.TitleBar_title_right));
        }

        // 图标设置

        if (ta.hasValue(R.styleable.TitleBar_icon_left)) {
            setLeftIcon(ta.getResourceId(R.styleable.TitleBar_icon_left, 0));
        } else {
            // 显示返回图标
            if (ta.getBoolean(R.styleable.TitleBar_icon_back, true)) {
                // setLeftIcon(ThemeUtils.isLight() ? R.drawable.byte_icon_back : R.drawable.byte_icon_white_back);
            }
        }

        if (ta.hasValue(R.styleable.TitleBar_icon_right)) {
            setRightIcon(ta.getResourceId(R.styleable.TitleBar_icon_right, 0));
        }

        //文字颜色设置
        mLeftView.setTextColor(ta.getColor(R.styleable.TitleBar_color_left, Color.parseColor("#0D0E0E")));
        mTitleView.setTextColor(ta.getColor(R.styleable.TitleBar_color_title, Color.parseColor("#0D0E0E")));
        mRightView.setTextColor(ta.getColor(R.styleable.TitleBar_color_right, Color.parseColor("#0D0E0E")));

        //文字大小设置
        mLeftView.setTextSize(TypedValue.COMPLEX_UNIT_PX, Utils.dip2px(getContext(), 14));
        mTitleView.setTextSize(TypedValue.COMPLEX_UNIT_PX, Utils.dip2px(getContext(), 16));
        mRightView.setTextSize(TypedValue.COMPLEX_UNIT_PX, Utils.dip2px(getContext(), 14));


        //背景设置
        //mLeftView.setBackgroundResource(ta.getResourceId(R.styleable.TitleBar_background_left, R.drawable.selector_selectable_transparent));
        //mRightView.setBackgroundResource(ta.getResourceId(R.styleable.TitleBar_background_right, R.drawable.selector_selectable_transparent));

        //分割线设置
        mLineView.setVisibility(ta.getBoolean(R.styleable.TitleBar_line, true) ? View.VISIBLE : View.GONE);

        if (ta.hasValue(R.styleable.TitleBar_color_line)) {
            mLineView.setBackgroundColor(ta.getColor(R.styleable.TitleBar_color_line, Color.parseColor("#414042")));
        }

        //回收TypedArray
        ta.recycle();

        //设置默认背景
        if (getBackground() == null) {
            setBackgroundColor(Color.parseColor("#ffffff"));
        }
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        //设置TitleBar默认的高度
        if (MeasureSpec.getMode(heightMeasureSpec) == MeasureSpec.AT_MOST || MeasureSpec.getMode(heightMeasureSpec) == MeasureSpec.UNSPECIFIED) {
            super.onMeasure(widthMeasureSpec, MeasureSpec.makeMeasureSpec(Builder.getActionBarHeight(getContext()) + (mLineView.getVisibility() == View.VISIBLE ? Builder.getLineHeight(getContext()) : 0), MeasureSpec.EXACTLY));
        } else {
            super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        }
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        mTitleView.setOnClickListener(this);
        mLeftView.setOnClickListener(this);
        mRightView.setOnClickListener(this);
    }

    @Override
    protected void onDetachedFromWindow() {
        mTitleView.setOnClickListener(null);
        mLeftView.setOnClickListener(null);
        mRightView.setOnClickListener(null);
        super.onDetachedFromWindow();
    }

    public TitleBar setOnTitleBarClickListener(OnTitleBarClickListener listener) {
        mListener = listener;
        return this;
    }

    public interface OnTitleBarClickListener {

        void onLeftClick(View v);

        void onTitleClick(View v);

        void onRightClick(View v);
    }

    public static class OnTitleBarClickImp implements OnTitleBarClickListener {

        private Context mContext;

        public OnTitleBarClickImp(Context context) {
            mContext = context;
        }

        @Override
        public void onLeftClick(View v) {

            if (mContext instanceof Activity) {

                ((Activity) mContext).finish();
            }
        }

        @Override
        public void onTitleClick(View v) {
            //nothing to do
        }

        @Override
        public void onRightClick(View v) {
            //nothing to do
        }
    }


    // View.OnClickListener
    @Override
    public void onClick(View v) {
        if (mListener == null) return;

        if (v == mLeftView) {
            mListener.onLeftClick(v);
        } else if (v == mTitleView) {
            mListener.onTitleClick(v);
        } else if (v == mRightView) {
            mListener.onRightClick(v);
        }
    }

    public TitleBar setTitle(CharSequence text) {
        mTitleView.setText(text);
        post();
        return this;
    }

    public TitleBar setLeftTitle(CharSequence text) {
        mLeftView.setText(text);
        post();
        return this;
    }

    public TitleBar setRightTitle(CharSequence text) {
        mRightView.setText(text);
        post();
        return this;
    }

    public TitleBar setTitleIcon(@DrawableRes int res) {
        mTitleView.setCompoundDrawablesWithIntrinsicBounds(null, null, getContext().getResources().getDrawable(res), null);
        mTitleView.setCompoundDrawablePadding(10);
        post();
        return this;
    }

    public TitleBar setLeftIcon(int res) {
        Drawable drawable;
        if (res == 0) {
            drawable = null;
        } else {
            drawable = getContext().getDrawable(res);
        }
        mLeftView.setCompoundDrawablesWithIntrinsicBounds(drawable, null, null, null);
        post();
        return this;
    }

    public TitleBar setRightIcon(int res) {
        Drawable drawable;
        if (res == 0) {
            drawable = null;
        } else {
            drawable = getContext().getDrawable(res);
        }
        mRightView.setCompoundDrawablesWithIntrinsicBounds(null, null, drawable, null);
        post();
        return this;
    }

    public TitleBar setLine(boolean show) {
        mLineView.setVisibility(show ? View.VISIBLE : View.GONE);
        post();
        return this;
    }

    public void setTitleAlpha(float alpha) {
        mTitleView.setAlpha(alpha);
        post();
    }

    private void post() {
        postDelayed(this, 100);
    }


    // Runnable
    @Override
    public void run() {
        //更新View状态
        if (!"".equals(mLeftView.getText().toString()) || mLeftView.getCompoundDrawables()[0] != null) {
            mLeftView.setEnabled(true);
        }
        if (!"".equals(mTitleView.getText().toString())) {
            mTitleView.setEnabled(true);
        }
        if (!"".equals(mRightView.getText().toString()) || mRightView.getCompoundDrawables()[2] != null) {
            mRightView.setEnabled(true);
        }
    }
}
