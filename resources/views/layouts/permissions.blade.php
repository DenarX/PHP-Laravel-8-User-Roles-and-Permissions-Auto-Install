<div class="col-xs-12 col-sm-12 col-md-12 mb-2">
    <div class="text-center w-100">
        <strong>Permissions:</strong>
    </div>
    <div class="row">
        <div class="col">
            <strong>{{Form::label('User')}}</strong>
            {{Form::select('permission[]', array_column($permission['user'],'name','id'), $modelPermissions??[], 
                    [ 
                    'multiple', 
                    'is' => "select-component",
                    'search'=>true,
                    'selectall'=>true,
                    'selected-options',
                    ])}}
        </div>
        <div class="col">
            <strong>{{Form::label('Role')}}</strong>
            {{Form::select('permission[]', array_column($permission['role'],'name','id'), $modelPermissions??[], 
                    [ 
                    'is' => "select-component",
                    'multiple', 
                    'search',
                    'selectall',
                    'selected-options',
                    ])}}
        </div>
        <div class="col">
            <strong>{{Form::label('product')}}</strong>
            {{Form::select('permission[]', array_column($permission['product'],'name','id'), $modelPermissions??[], 
                    [ 
                    'multiple', 
                    'is' => "select-component",
                    'search'=>true,
                    'selectall'=>true,
                    'selected-options',
                    ])}}
        </div>
        <div class="col">
            <strong>{{Form::label('productId')}}</strong>
            {{Form::select('permission[]', array_column($permission['productId'],'name','id'), $modelPermissions??[], 
                    [
                    'multiple', 
                    'is' => "select-component",
                    'search'=>true,
                    'selectall'=>true,
                    'selected-options',
                    ])}}
        </div>
    </div>
</div>